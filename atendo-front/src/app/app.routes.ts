import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'painel' },
      {
        path: 'painel',
        loadComponent: () => import('./pages/painel/painel.component').then((m) => m.PainelComponent),
      },
      {
        path: 'kanban',
        loadComponent: () => import('./pages/kanban/kanban.component').then((m) => m.KanbanComponent),
      },
      {
        path: 'tabela',
        loadComponent: () => import('./pages/tabela/tabela.component').then((m) => m.TabelaComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
