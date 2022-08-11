import { login, logout, getInfo } from '@/api/user'
import { getById } from '@/api/role'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,asyncRoutes } from '@/router'
import * as _ from 'lodash'

const getDefaultState = () => {
  return {
    token: getToken(),
    id : '',
    account: '',
    name: '',
    avatar: '',
    role : '',
    role_type : -1,
    menus:[]
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ACCOUNT: (state, account) => {
    state.account = account
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_MENUS: (state, menus) => {
    // Vue.set(state, 'menus', menus)
    state.menus = menus
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_ROLE_TYPE: (state, role_type) => {
    state.role_type = role_type
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(data => {
        commit('SET_TOKEN', data._id)
        commit('SET_ID', data._id)
        setToken(data._id)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(data => {
        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar, account, role } = data

        commit('SET_NAME', name)
        commit('SET_ACCOUNT', account)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLE', role)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  getMenus({commit, state}){
    return new Promise((resolve, reject) => {
      getById(state.role).then(role => {
        let filter = role.menus;
        let menus = _.cloneDeep(asyncRoutes);//此处用这种方法深拷贝一下asyncRoutes，解决sidebar渲染问题
        if(role.name !== 'root'){
          menus = doFilter(menus, filter);
        }

        commit('SET_ROLE_TYPE', role.type)
        commit('SET_MENUS', menus)
        resolve(menus)
      }).catch(error => {
        reject(error)
      });
    });
  },

  // user logout
  logout({ commit, state, dispatch}) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')

        dispatch('tagsView/delAllViews', null, { root: true })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

/**
 * @param list
 * @param all
 * @return {Array|*}
 */
function doFilter(list, all){
  if(list.length === 0){
    return[];
  }
  return list.filter(item => {
    //first valid children node permission,
    if(item.children && item.children.length > 0){
      item.children = doFilter(item.children, all);
    }
    //valid if this node is included
    if(item.meta && all.includes(item.meta.key)){
      return true
    }else{
      return item.children && item.children.length > 0
    }
  });
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

