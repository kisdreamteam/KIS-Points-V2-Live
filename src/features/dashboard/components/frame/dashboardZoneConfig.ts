export type ToolbarActionId =
  | 'close-editor'
  | 'add'
  | 'edit'
  | 'layout-manager'
  | 'teacher-view'
  | 'point-log'

export type ToolbarActionDef = {
  id: ToolbarActionId
  title: string
  disabled?: boolean
}

export type DashboardToolbarDef = {
  className: string
  topActions: ToolbarActionDef[]
  bottomActions: ToolbarActionDef[]
}
