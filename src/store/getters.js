const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    token: state => state.user.token,
    avatar: state => state.user.user.avatar,
    roles: state => state.user.roles,
    user: state => state.user.user,
    permissions: state => state.user.permissions,
    loadMenus: state => state.user.loadMenus,
    MyRouters: state => state.permission.routers,
    crud: state => state.crud.url,
    updateAvatarApi: state => state.api.updateAvatarApi,
    sqlApi: state => state.api.sqlApi,
    swaggerApi: state => state.api.swaggerApi
  }
  export default getters
  