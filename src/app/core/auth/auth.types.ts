export type RecordType = 'employee' | 'department';

export type Action = 'read' | 'create' | 'edit' | 'delete';

export interface Permission {
  recordType: RecordType;
  action: Action;
}

export interface AuthUser {
  username: string;
  displayName: string;
  permissions: Permission[];
}
