import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { title: 'Quasar SQLite App' },
      },
      {
        path: 'user',
        name: 'UserPage',
        component: () => import('pages/UserPage.vue'),
        meta: { title: 'Quasar SQLite App' },
      },
      {
        path: 'medicine',
        name: 'MedicinePage',
        component: () => import('pages/MedicinePage.vue'),
        meta: { title: 'Quasar SQLite App' },
      },
      {
        path: 'user-detail/:id',
        name: 'UserDetailPage',
        component: () => import('pages/UserDetailPage.vue'),
        meta: { title: 'Quasar SQLite App' },
      },
      {
        path: 'add-user',
        name: 'AddUserPage',
        component: () => import('pages/AddUserPage.vue'),
        meta: { title: 'Quasar SQLite App' },
      },
      {
        path: 'checkout/:id',
        name: 'CheckOut',
        component: () => import('pages/CheckOut.vue'),
        meta: { title: 'Quasar SQLite App' },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
