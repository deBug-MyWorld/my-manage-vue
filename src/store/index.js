import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import crud from './modules/crud'
import api from './modules/api'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    crud,
    api
  },
  getters
})
