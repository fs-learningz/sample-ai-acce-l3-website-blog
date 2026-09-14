import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Emerald Blog',
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./pages/post-detail/post-detail').then(m => m.PostDetail),
    title: 'Emerald Blog',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'Admin login · Emerald Blog',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/admin-posts/admin-posts').then(m => m.AdminPosts),
        title: 'My posts · Emerald Blog admin',
      },
      {
        path: 'editor',
        loadComponent: () => import('./admin/post-editor/post-editor').then(m => m.PostEditor),
        title: 'New post · Emerald Blog admin',
      },
      {
        path: 'editor/:id',
        loadComponent: () => import('./admin/post-editor/post-editor').then(m => m.PostEditor),
        title: 'Edit post · Emerald Blog admin',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];