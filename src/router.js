import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Letters from './views/Letters.vue'
import SignIn from './views/SignIn.vue'
import SignUp from './views/SignUp.vue'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/letters',
      name: 'letters_dashboard',
      meta: {
        requiresAuth: true
      },
      component: Letters
    },
    {
      path: '/letters/:all_letters',
      name: 'letters',
      meta: {
        requiresAuth: true
      },
      component: Letters
    },
    {
      path: '/account',
      name: 'account',
      meta: {
        requiresAuth: true
      },
      component: () => import('./views/Account.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      meta: {
        requiresAuth: true
      },
      component: () => import('./views/Settings.vue')
    },
    {
      path: '/report',
      name: 'report',
      meta: {
        requiresAuth: true
      },
      component: () => import('./views/Report.vue')
    },
    {
      path: '/signin',
      name: 'signin',
      meta: {
        requiresGuest: true
      },
      component: SignIn
    },
    {
      path: '/signup',
      name: 'signup',
      meta: {
        requiresGuest: true
      },
      component: SignUp
    },
    {
      path: '/invitation/:sender_id',
      name: 'invitation',
      component: () => import('./views/Invitation.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  // ! Check for required auth guard
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // * Check if not logged in
    if (!firebase.auth().currentUser) {
      // * Go to log in
      next({
        path: '/signin',
        query: {
          redirect: to.fullPath
        }
      })
    }
    else {
      next()
    }
  }
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    // * Checked if logged in
    // console.log(firebase.auth().currentUser.email)
    if (firebase.auth().currentUser) {
      // * Go to dashboard
      next({
        path: '/',
        query: {
          redirect: to.fullPath
        }
      })
    }
    else {
      next()
    }
  }
  else {
    next()
  }
})

export default router;