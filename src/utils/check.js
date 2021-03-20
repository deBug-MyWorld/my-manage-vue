import store from '../store'

export function hasPermission(permission) {
  let myPermissions = store.getters.permissions;
  if (myPermissions.indexOf(permission) > -1 || myPermissions.indexOf('ROLE_admin')>-1) {
    return false;  // 有权限则不禁用
  } else {
    return true;
  }
}