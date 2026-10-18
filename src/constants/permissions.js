// src/constants/permissions.js
export const PERMISSIONS = {
  VIEW_CLIENTS: "view_clients",
  ADD_CLIENTS: "add_clients",
  EDIT_CLIENTS: "edit_clients",
  DELETE_CLIENTS: "delete_clients",
  VIEW_RECYCLE_BIN: "view_recycle_bin",
  RESTORE_CLIENTS: "restore_clients",
  MANAGE_USERS: "manage_users",
  MANAGE_EMPLOYEES: "manage_employees", // new
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  admin: ALL_PERMISSIONS,
  attorney: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.ADD_CLIENTS,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.VIEW_RECYCLE_BIN,
  ],
  paralegal: [PERMISSIONS.VIEW_CLIENTS, PERMISSIONS.ADD_CLIENTS],
};
