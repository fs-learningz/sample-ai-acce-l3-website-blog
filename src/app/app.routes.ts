import { Routes } from '@angular/router';
import { adminGuard, adminRoleGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Full-Stack Blog',
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./pages/post-detail/post-detail').then((m) => m.PostDetail),
    title: 'Post · Full-Stack Blog',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Admin Login · Full-Stack Blog',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'posts',
      },
      {
        path: 'posts',
        loadComponent: () => import('./pages/admin/posts/posts').then((m) => m.AdminPosts),
        title: 'My Posts · Admin',
      },
      {
        path: 'editor',
        loadComponent: () => import('./pages/admin/editor/editor').then((m) => m.Editor),
        title: 'Editor · Admin',
      },
      {
        path: 'editor/:id',
        loadComponent: () => import('./pages/admin/editor/editor').then((m) => m.Editor),
        title: 'Edit Post · Admin',
      },
      {
        path: 'users',
        canActivate: [adminRoleGuard],
        loadComponent: () => import('./pages/admin/users/users').then((m) => m.AdminUsers),
        title: 'Users · Admin',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
