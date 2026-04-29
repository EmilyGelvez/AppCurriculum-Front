import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // 1. RUTAS PÚBLICAS (Fuera del MainLayout para evitar conflictos de sesión)
  {
    path: '/login',
    component: () => import('pages/login.vue'),
  },
  {
    path: '/SolicitarRecuperacion',
    component: () => import('pages/SolicitarRecuperacion.vue'),
  },
  {
    path: '/recuperarClave',
    component: () => import('pages/recuperarClave.vue'),
  },

  // 2. RUTAS PRIVADAS (Dentro del MainLayout)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'Curriculums', component: () => import('pages/Curriculums.vue') },
      { path: 'usuarios', component: () => import('pages/usuarios.vue') },
    ],
  },

  // 3. ERROR 404 (Siempre al final)
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;