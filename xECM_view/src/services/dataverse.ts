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
    const filterQuery = `_proto_wonumber_value eq ${currentRecordId}`;
    const attachmentResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
      entityName,
      `?$filter=${filterQuery}&$select=proto_activitymimeattachmentid,proto_attachmentname,proto_attachmenttype`
    );

    if (attachmentResult.entities.length === 0) {
      return [];
    }

    const attachmentTypeById = new Map<string, string>();
    attachmentResult.entities.forEach((record: any) => {
      const recordId = record.proto_activitymimeattachmentid || record.id;
      const typeLabel = record['proto_attachmenttype@OData.Community.Display.V1.FormattedValue'] || '';
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
