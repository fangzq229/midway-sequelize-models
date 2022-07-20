import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/views/index').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/tables',
      name: 'tables',
      component: require('@/views/tables').default
    },
    {
      path: '/json-to-dto',
      name: 'jsonToDto',
      component: require('@/views/json-to-dto').default
    }
  ]
})
