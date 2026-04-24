import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => { // Eliminamos next de los parámetros
    const token = localStorage.getItem('orinoco_token');
    const isPublicPage = to.path === '/login';
    const loggedIn = !!token;

    if (!isPublicPage && !loggedIn) {
      return '/login'; // Retorno directo
    }

    if (isPublicPage && loggedIn) {
      return '/'; // Retorno directo
    }
    // Si no retorna nada, continúa normalmente
  });

  return Router;
});

