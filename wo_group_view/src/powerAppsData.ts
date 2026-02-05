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
