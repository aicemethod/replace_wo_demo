import type { FileData } from '../types';

// Dataverseからファイルデータを取得
export async function fetchFileData(): Promise<FileData[]> {
  // Xrm.WebApiが利用可能かチェック
  if (typeof (window.parent as any).Xrm === 'undefined' || !(window.parent as any).Xrm?.WebApi) {
    console.warn('Xrm.WebApiが利用できません');
    return [];
  }

  try {
    // 現在開いているフォームのレコードIDを取得
    let currentRecordId: string | null = null;
    try {
      const xrm = (window.parent as any).Xrm;
      if (xrm?.Page?.data?.entity?.getId) {
        currentRecordId = xrm.Page.data.entity.getId().replace(/[{}]/g, '');
      }
    } catch (err) {
      console.error('Failed to get current record ID:', err);
      return [];
    }

    if (!currentRecordId) {
      console.warn('現在のフォームのレコードIDを取得できませんでした');
      return [];
    }

    const entityName = 'proto_activitymimeattachment';
    const filterQuery = `_proto_passdown_value eq ${currentRecordId}`;
    const attachmentResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
      entityName,
      `?$filter=${filterQuery}&$select=proto_activitymimeattachmentid,proto_attachmentname,proto_attachmenttype`
    );

    if (attachmentResult.entities.length === 0) {
      return [];
    }

    const attachmentTypeById = new Map<string, string>();
    const attachmentTypeLabelMap: Record<number, string> = {
      931440004: 'PPAC',
      931440005: 'KYM',
      931440006: 'Other'
    };

    attachmentResult.entities.forEach((record: any) => {
      const recordId = record.proto_activitymimeattachmentid || record.id;
      const rawValue = record.proto_attachmenttype;
      const fallbackLabel = record['proto_attachmenttype@OData.Community.Display.V1.FormattedValue'] || '';
      const typeLabel = typeof rawValue === 'number' ? (attachmentTypeLabelMap[rawValue] || fallbackLabel) : fallbackLabel;
      attachmentTypeById.set(recordId, typeLabel);
    });

    // 各proto_activitymimeattachmentに紐づくannotationレコードを取得
    const annotationPromises = attachmentResult.entities.map(async (record: any) => {
      const recordId = record.proto_activitymimeattachmentid || record.id;
      try {
        const annotationResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
          'annotation',
          `?$filter=_objectid_value eq ${recordId}&$select=subject,filename,annotationid,createdon,notetext,documentbody&$orderby=createdon desc`
        );
        return annotationResult.entities.map((annotation: any) => ({
          ...annotation,
          _attachmentTypeLabel: attachmentTypeById.get(recordId) || ''
        }));
      } catch (err) {
        console.error(`Failed to fetch annotations for ${recordId}:`, err);
        return [];
      }
    });

    const annotationArrays = await Promise.all(annotationPromises);
    const allAnnotations = annotationArrays.flat();

    // FileData型に変換
    const fileData: FileData[] = allAnnotations.map((annotation: any) => {
      return {
        id: annotation.annotationid || annotation.id,
        filename: annotation.filename || '',
        Mimetype: annotation._attachmentTypeLabel || '',
        createdon: annotation.createdon || new Date().toISOString(),
        selected: false,
        documentbody: annotation.documentbody || '',
      };
    });

    return fileData;
  } catch (err: any) {
    console.error('Failed to fetch file data:', err);
    return [];
  }
}

type SaveFileParams = {
  typeValue: number;
  typeLabel: string;
  filename: string;
  file: File;
};

const getCurrentRecordId = (): string | null => {
  try {
    const xrm = (window.parent as any).Xrm;
    if (xrm?.Page?.data?.entity?.getId) {
      return xrm.Page.data.entity.getId().replace(/[{}]/g, '');
    }
  } catch (err) {
    console.error('Failed to get current record ID:', err);
  }
  return null;
};

const getPathdownName = async (recordId: string): Promise<string> => {
  const xrm = (window.parent as any).Xrm;
  const nameValue = xrm?.Page?.getAttribute?.('proto_name')?.getValue?.();
  if (typeof nameValue === 'string' && nameValue.trim()) {
    return nameValue;
  }
  try {
    const record = await xrm.WebApi.retrieveRecord('proto_pathdown', recordId, '?$select=proto_name');
    return record?.proto_name || '';
  } catch (err) {
    console.error('Failed to retrieve proto_name:', err);
    return '';
  }
};

const getEntitySetName = async (logicalName: string, fallback: string): Promise<string> => {
  const xrm = (window.parent as any).Xrm;
  try {
    if (xrm?.Utility?.getEntityMetadata) {
      const metadata = await xrm.Utility.getEntityMetadata(logicalName);
      if (metadata?.EntitySetName) {
        return metadata.EntitySetName;
      }
    }
  } catch (err) {
    console.warn(`Failed to get entity set name for ${logicalName}:`, err);
  }
  return fallback;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export async function saveFileAttachment(params: SaveFileParams): Promise<FileData | null> {
  if (typeof (window.parent as any).Xrm === 'undefined' || !(window.parent as any).Xrm?.WebApi) {
    console.warn('Xrm.WebApiが利用できません');
    return null;
  }

  const xrm = (window.parent as any).Xrm;
  const currentRecordId = getCurrentRecordId();
  if (!currentRecordId) {
    console.warn('現在のフォームのレコードIDを取得できませんでした');
    return null;
  }

  try {
    const pathdownName = await getPathdownName(currentRecordId);
    const pathdownSetName = await getEntitySetName('proto_pathdown', 'proto_pathdowns');
    const attachmentSetName = await getEntitySetName('proto_activitymimeattachment', 'proto_activitymimeattachments');

    const attachmentQuery = `?$filter=_proto_passdown_value eq ${currentRecordId} and proto_attachmenttype eq ${params.typeValue}&$select=proto_activitymimeattachmentid`;
    const attachmentResult = await xrm.WebApi.retrieveMultipleRecords('proto_activitymimeattachment', attachmentQuery);

    let attachmentId: string | null = null;
    if (attachmentResult.entities.length > 0) {
      attachmentId = attachmentResult.entities[0].proto_activitymimeattachmentid || attachmentResult.entities[0].id;
    } else {
      const attachmentName = pathdownName ? `${params.typeLabel}_${pathdownName}` : params.typeLabel;
      const createResponse = await xrm.WebApi.createRecord('proto_activitymimeattachment', {
        proto_attachmenttype: params.typeValue,
        proto_attachmentname: attachmentName,
        'proto_passdown@odata.bind': `/${pathdownSetName}(${currentRecordId})`
      });
      attachmentId = createResponse.id;
    }

    if (!attachmentId) {
      return null;
    }

    const documentbody = await fileToBase64(params.file);
    const annotationResponse = await xrm.WebApi.createRecord('annotation', {
      subject: params.filename,
      filename: params.filename,
      notetext: '',
      documentbody,
      mimetype: params.file.type || 'application/octet-stream',
      [`objectid_proto_activitymimeattachment@odata.bind`]: `/${attachmentSetName}(${attachmentId})`
    });

    return {
      id: annotationResponse.id,
      filename: params.filename,
      Mimetype: params.typeLabel,
      createdon: new Date().toISOString(),
      selected: false,
      documentbody
    };
  } catch (err: any) {
    console.error('Failed to save file attachment:', err);
    return null;
  }
}
