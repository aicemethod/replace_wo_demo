export type WorkGroupRow = {
  id: string
  woNumber: string
  woTitle: string
  status: string
  groupNumber: string
  groupTitle: string
  projectId: string
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
  if (!xrm?.WebApi?.retrieveMultipleRecords || !projectId) return []

  const query =
    `?$select=proto_wonumber,proto_wotitle,_proto_workordersubstatus_value,_proto_project_value` +
    `&$filter=_proto_project_value eq ${projectId}` +
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

  const filters = [
    account?.id ? `_proto_account_value eq ${normalizeId(account.id)}` : '',
    enduser?.id ? `_proto_enduser_value eq ${normalizeId(enduser.id)}` : '',
    bu?.id ? `_owningbusinessunit_value eq ${normalizeId(bu.id)}` : '',
    currentProjectId ? `_proto_project_value ne ${currentProjectId}` : '',
  ].filter(Boolean)

  if (filters.length === 0) return []

  const query =
    `?$select=proto_wonumber,proto_wotitle,_proto_workordersubstatus_value,_proto_project_value` +
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
  }))
}
