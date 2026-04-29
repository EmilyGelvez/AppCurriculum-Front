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

  Router.beforeEach((to) => {
    const token = localStorage.getItem('orinoco_token');
    const loggedIn = !!token;

    // 1. Definimos qué rutas son accesibles sin estar logueado 🔓
    // Agregamos '/recuperarClave' a la lista blanca
    const publicPages = ['/login', '/recuperarClave', '/SolicitarRecuperacion'];
    const isPublicPage = publicPages.includes(to.path);

    // 2. Si intenta ir a una página privada y NO está logueado -> al Login
    if (!isPublicPage && !loggedIn) {
      return '/login';
    }

    // 3. Si ya está logueado e intenta ir al login o recuperar clave -> al Inicio
    if (isPublicPage && loggedIn) {
      return '/';
    }
    
    // En cualquier otro caso, el router sigue su camino normalmente
  });

  return Router;
});