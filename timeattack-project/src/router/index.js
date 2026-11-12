import { createRouter, createWebHistory } from 'vue-router'
import GameBoardView from '../views/GameBoardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'game-board',
      component: GameBoardView,
    },
  ],
})

export default router
