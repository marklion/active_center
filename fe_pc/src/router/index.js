import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  }
]

export const lastRoutes = [
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

export const asyncRoutes = [
  {
    path: '/club',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'clubManager',
        component: () => import('@/views/club/index'),
        meta: {title: '俱乐部管理', icon: 'el-icon-place', key: 'club'}
      },
      {
        path: 'edit',
        name: 'accountEdit',
        component: () => import('@/views/club/edit'),
        meta: {title: '信息编辑', icon: 'el-icon-place', key: 'club-edit'},
        hidden: true
      }
    ]
  },
  {
    path: '/account',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'accountManage',
        component: () => import('@/views/account/index'),
        meta: {title: '账号管理', icon: 'el-icon-user', key: 'account'}
      },
      {
        path: 'edit',
        name: 'accountEdit',
        component: () => import('@/views/account/edit'),
        meta: {title: '账号修改', icon: 'el-icon-user', key: 'account-edit'},
        hidden: true
      }
    ]
  },
  {
    path: '/role',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'roleManage',
        component: () => import('@/views/role/index'),
        meta: {title: '角色管理', icon: 'el-icon-user',  key: 'role'}
      },
      {
        path: 'edit',
        name: 'roleEdit',
        component: () => import('@/views/role/edit'),
        meta: {title: '角色编辑', icon: 'el-icon-user',  key: 'role-edit'},
        hidden: true
      }
    ]
  },
  {
    path: '/toy',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'toyManage',
        component: () => import('@/views/toy/index'),
        meta: {title: '鸽群管理', icon: 'el-icon-house',  key: 'toy'}
      },
      // {
      //   path: 'edit',
      //   name: 'toyEdit',
      //   component: () => import('@/views/toy/edit'),
      //   meta: {title: '鸽群编辑', icon: 'el-icon-user',  key: 'toy-edit'},
      //   hidden: true
      // }
    ]
  },
  {
    path: '/template',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'templateManage',
        component: () => import('@/views/template/index'),
        meta: {title: '赛事模板管理', icon: 'el-icon-s-grid',  key: 'template'}
      },
      {
        path: 'edit',
        name: 'templateEdit',
        component: () => import('@/views/template/edit'),
        meta: {title: '赛事模板编辑', icon: 'el-icon-s-grid',  key: 'template-edit'},
        hidden: true
      }
    ]
  },
  {
    path: '/active',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'activeManage',
        component: () => import('@/views/active/index'),
        meta: {title: '赛事管理', icon: 'el-icon-trophy-1',  key: 'active'}
      },
      {
        path: 'edit',
        name: 'activeEdit',
        component: () => import('@/views/active/edit'),
        meta: {title: '赛事编辑', icon: 'el-icon-trophy-1',  key: 'active-edit'},
        hidden: true
      }
    ]
  },
  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: 'Example', icon: 'el-icon-s-help', key:'example' },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: { title: 'Table', icon: 'table', key:'table' }
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/tree/index'),
        meta: { title: 'Tree', icon: 'tree', key:'tree' }
      }
    ]
  },{
    path: '/registration',
    component: Layout,
    children: [{
      path: 'index',
      name: 'registration',
      component: () => import('@/views/registration/index'),
      meta: { title: '赛事报名', icon: 'el-icon-s-claim', key: 'registration-index'}
    },{
      path: 'edit',
      name: 'registrationEdit',
      component: () => import('@/views/registration/edit'),
      meta: { title: '报名表', icon: 'el-icon-s-claim', key: 'registration-edit'},
      hidden: true
    },{
      path: 'stat',
      name: 'registrationStat',
      component: () => import('@/views/registration/stat'),
      meta: { title: '参赛明细', icon: 'el-icon-s-claim', key: 'registration-stat'},
      hidden: true
    }]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
