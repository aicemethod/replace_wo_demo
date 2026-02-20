export type WorkGroupRow = {
  id: string
  woNumber: string
  woTitle: string
  status: string
  groupNumber: string
  groupTitle: string
  projectId: string
  endUser?: string
  bu?: string
  woType?: string
  equipmentSn?: string
  woStatus?: string
  calcStatus?: string
  customerPoNo?: string
  customerPoNoText?: string
  soNo?: string
  soNoText?: string
  primarySo?: string
}

type LookupValue = {
  id?: string
  name?: string
  entityType?: string
}

type FormAttribute = {
  getValue: () => unknown
}

type FormContext = {
  data: {
    entity: {
      getId: () => string
    }
  }
  getAttribute: (name: string) => FormAttribute | null
}

type XrmLike = {
  Page?: FormContext
  WebApi?: {
    retrieveRecord: (entityName: string, id: string, query?: string) => Promise<any>
    updateRecord: (entityName: string, id: string, data: Record<string, unknown>) => Promise<any>
    retrieveMultipleRecords: (entityName: string, query?: string) => Promise<any>
  }
  Navigation?: {
    openForm: (options: { entityName: string; entityId: string }) => Promise<any>
  }
}

const getXrm = (): XrmLike | null => {
  const parentXrm = (window as any)?.parent?.Xrm
  const selfXrm = (window as any)?.Xrm
  return parentXrm ?? selfXrm ?? null
}

const getFormContext = (): FormContext | null => {
  const xrm = getXrm()
  if (xrm?.Page) return xrm.Page
  return null
}

const readText = (form: FormContext, name: string) => {
  const value = form.getAttribute(name)?.getValue()
  return typeof value === 'string' ? value : ''
}

const readLookup = (form: FormContext, name: string): LookupValue | null => {
  const value = form.getAttribute(name)?.getValue()
  if (Array.isArray(value) && value[0]) {
    const item = value[0] as LookupValue
    return { id: item.id, name: item.name, entityType: item.entityType }
  }
  return null
}

const normalizeId = (id?: string) => (id ?? '').replace(/[{}]/g, '')

export const getCurrentProjectId = () => {
  const form = getFormContext()
  if (!form) return ''
  const projectLookup = readLookup(form, 'proto_project')
  return normalizeId(projectLookup?.id)
}

export const getCurrentWorkorderId = () => {
  const form = getFormContext()
  if (!form) return ''
  const entityId = form.data.entity.getId()
  return normalizeId(entityId)
}

export const getWorkGroupRows = async (): Promise<WorkGroupRow[]> => {
  const form = getFormContext()
  if (!form) return []

  const entityId = form.data.entity.getId()
  const woNumber = readText(form, 'proto_wonumber')
  const woTitle = readText(form, 'proto_wotitle')
  const statusLookup = readLookup(form, 'proto_workordersubstatus')
  const projectLookup = readLookup(form, 'proto_project')

  let projectTitle = projectLookup?.name ?? ''
  const projectId = normalizeId(projectLookup?.id)

  if (!projectTitle && projectId) {
    const xrm = getXrm()
    if (xrm?.WebApi?.retrieveRecord) {
      const record = await xrm.WebApi.retrieveRecord(
        'proto_project',
        projectId,
        '?$select=proto_name'
      )
      projectTitle = record?.proto_name ?? ''
    }
  }

  return [
    {
      id: normalizeId(entityId),
      woNumber,
      woTitle,
      status: statusLookup?.name ?? '',
      groupNumber: projectLookup?.name ?? '',
      groupTitle: projectTitle,
      projectId,
    },
  ]
}

export const updateProjectName = async (projectId: string, name: string) => {
  const normalizedId = normalizeId(projectId)
  if (!normalizedId) return
  const xrm = getXrm()
  if (!xrm?.WebApi?.updateRecord) return
  await xrm.WebApi.updateRecord('proto_project', normalizedId, {
    proto_name: name,
  })
}

export const getSameGroupRows = async (): Promise<WorkGroupRow[]> => {
  const xrm = getXrm()
  const projectId = getCurrentProjectId()
  const currentWorkorderId = getCurrentWorkorderId()
  if (!xrm?.WebApi?.retrieveMultipleRecords || !projectId) return []

  const query =
    `?$select=proto_wonumber,proto_wotitle,_proto_workordersubstatus_value,_proto_project_value` +
    `&$filter=_proto_project_value eq ${projectId}` +
    (currentWorkorderId ? ` and proto_workorderid ne ${currentWorkorderId}` : '') +
    `&$expand=proto_project($select=proto_name)`

  const result = await xrm.WebApi.retrieveMultipleRecords('proto_workorder', query)
  const rows = (result?.entities ?? []) as any[]

  return rows.map((row) => ({
    id: normalizeId(row.proto_workorderid ?? row.activityid ?? row.id ?? ''),
    woNumber: row.proto_wonumber ?? '',
    woTitle: row.proto_wotitle ?? '',
    status: row['_proto_workordersubstatus_value@OData.Community.Display.V1.FormattedValue'] ?? '',
    groupNumber: row['_proto_project_value@OData.Community.Display.V1.FormattedValue'] ?? '',
    groupTitle: row.proto_project?.proto_name ?? '',
    projectId: normalizeId(row._proto_project_value),
  }))
}

export const getMainRows = async (): Promise<WorkGroupRow[]> => {
  const xrm = getXrm()
  const form = getFormContext()
  if (!xrm?.WebApi?.retrieveMultipleRecords || !form) return []

  const account = readLookup(form, 'proto_account')
  const enduser = readLookup(form, 'proto_enduser')
  const bu = readLookup(form, 'owningbusinessunit')
  const currentProjectId = getCurrentProjectId()
  const currentWorkorderId = getCurrentWorkorderId()

  const filters = [
    account?.id ? `_proto_account_value eq ${normalizeId(account.id)}` : '',
    enduser?.id ? `_proto_enduser_value eq ${normalizeId(enduser.id)}` : '',
    bu?.id ? `_owningbusinessunit_value eq ${normalizeId(bu.id)}` : '',
    currentProjectId ? `_proto_project_value ne ${currentProjectId}` : '',
    currentWorkorderId ? `proto_workorderid ne ${currentWorkorderId}` : '',
  ].filter(Boolean)

  if (filters.length === 0) return []

  const query =
    `?$select=proto_wonumber,proto_wotitle,_proto_workordersubstatus_value,_proto_project_value,_proto_enduser_value,_owningbusinessunit_value,_proto_wotype_value,_proto_devicesearch_value,proto_calc_status,_proto_primaryso_value,proto_kyakusakichuban,proto_kyakusakichubantext,proto_wo_tmp_so_no_text,_proto_wo_soassociation_value` +
    `&$filter=${filters.join(' and ')}` +
    `&$expand=proto_project($select=proto_name)`

  const result = await xrm.WebApi.retrieveMultipleRecords('proto_workorder', query)
  const rows = (result?.entities ?? []) as any[]

  return rows.map((row) => ({
    id: normalizeId(row.proto_workorderid ?? row.activityid ?? row.id ?? ''),
    woNumber: row.proto_wonumber ?? '',
    woTitle: row.proto_wotitle ?? '',
    status: row['_proto_workordersubstatus_value@OData.Community.Display.V1.FormattedValue'] ?? '',
    groupNumber: row['_proto_project_value@OData.Community.Display.V1.FormattedValue'] ?? '',
    groupTitle: row.proto_project?.proto_name ?? '',
    projectId: normalizeId(row._proto_project_value),
    endUser:
      row['_proto_enduser_value@OData.Community.Display.V1.FormattedValue'] ??
      row.proto_enduser ??
      '',
    bu:
      row['_owningbusinessunit_value@OData.Community.Display.V1.FormattedValue'] ??
      row.owningbusinessunit ??
      '',
    woType:
      row['_proto_wotype_value@OData.Community.Display.V1.FormattedValue'] ??
      row.proto_wotype ??
      '',
    equipmentSn:
      row['_proto_devicesearch_value@OData.Community.Display.V1.FormattedValue'] ??
      row.proto_devicesearch ??
      '',
    woStatus: row['_proto_workordersubstatus_value@OData.Community.Display.V1.FormattedValue'] ?? '',
    calcStatus:
      row['proto_calc_status@OData.Community.Display.V1.FormattedValue'] ??
      row.proto_calc_status ??
      '',
    customerPoNo: row.proto_kyakusakichuban ?? '',
    customerPoNoText: row.proto_kyakusakichubantext ?? '',
    soNo: row['_proto_wo_soassociation_value@OData.Community.Display.V1.FormattedValue'] ?? '',
    soNoText: row.proto_wo_tmp_so_no_text ?? '',
    primarySo:
      row['_proto_primaryso_value@OData.Community.Display.V1.FormattedValue'] ??
      row.proto_primaryso ??
      '',
  }))
}

export const updateWorkordersProject = async (workorderIds: string[]) => {
  const xrm = getXrm()
  const projectId = getCurrentProjectId()
  if (!xrm?.WebApi?.updateRecord || !projectId || workorderIds.length === 0) return

  const bind = {
    'proto_project@odata.bind': `/proto_projects(${projectId})`,
  }

  await Promise.all(
    workorderIds.map((id) => xrm.WebApi!.updateRecord('proto_workorder', id, bind))
  )
}

export const clearWorkordersProject = async (workorderIds: string[]) => {
  const xrm = getXrm()
  if (!xrm?.WebApi?.updateRecord || workorderIds.length === 0) return

  const clear = {
    'proto_project@odata.bind': null,
  }

  await Promise.all(
    workorderIds.map((id) => xrm.WebApi!.updateRecord('proto_workorder', id, clear))
  )
}

export const openWorkorderForm = async (id: string) => {
  const xrm = getXrm()
  const normalizedId = normalizeId(id)
  if (!xrm?.Navigation?.openForm || !normalizedId) return
  await xrm.Navigation.openForm({
    entityName: 'proto_workorder',
    entityId: normalizedId,
  })
}

export const openProjectForm = async (id: string) => {
  const xrm = getXrm()
  const normalizedId = normalizeId(id)
  if (!xrm?.Navigation?.openForm || !normalizedId) return
  await xrm.Navigation.openForm({
    entityName: 'proto_project',
    entityId: normalizedId,
  })
}
