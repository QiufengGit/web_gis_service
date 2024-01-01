import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import CesiumViewer from '@/components/CesiumViewer.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: CesiumViewer
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
