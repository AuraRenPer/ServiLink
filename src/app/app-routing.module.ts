import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// author: Pérez Ugalde Aura Renata

// Importar AuthGuard para proteger rutas
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'loading-init',
    loadChildren: () => import('./pages/loading-inicial/loading-inicial.module').then(m => m.LoadingInicialPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'loading-init',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'loading-success',
    loadChildren: () => import('./pages/loading-success/loading-success.module').then(m => m.LoadingSuccessPageModule)
  },

  // Nueva ruta protegida: "Admin Users" (solo para usuarios con todos los permisos)
  {
    path: 'admin-users',
    loadChildren: () => import('./pages/admin-users/admin-users.module').then(m => m.AdminUsersPageModule),
    canActivate: [AuthGuard],
    data: { roles: ['master'] } // Solo accesible para "master"
  },

  // Nueva ruta protegida: "View My Profile" (Disponible para todos los usuarios autenticados)
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },

  {
    path: '**',
    redirectTo: 'loading-init',
    pathMatch: 'full'
  },
  {
    path: 'admin-users',
    loadChildren: () => import('./pages/admin-users/admin-users.module').then( m => m.AdminUsersPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
