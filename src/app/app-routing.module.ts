import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // 🚀 Pantalla de carga inicial (irá a Login después de 3s)
  {
    path: 'loading-init',
    loadChildren: () => import('./pages/loading-inicial/loading-inicial.module').then(m => m.LoadingInicialPageModule)
  },

  // 🚀 Página de Login
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.HomePageModule)
  },

  // 🚀 Redirección al Home si no se encuentra una ruta válida
  {
    path: '',
    redirectTo: 'loading-init',
    pathMatch: 'full'
  },

  // 🚀 Página de Registro
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule)
  },

  // 🚀 Página de Home
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },

  // 🚀 Pantalla de carga antes de Home (Loading Success)
  {
    path: 'loading-success',
    loadChildren: () => import('./pages/loading-success/loading-success.module').then(m => m.LoadingSuccessPageModule)
  },

  // 🚀 Si la ruta no existe, redirige a `loading-init`
  {
    path: '**',
    redirectTo: 'loading-init',
    pathMatch: 'full'
  },
  {
    path: 'loading-success',
    loadChildren: () => import('./pages/loading-success/loading-success.module').then( m => m.LoadingSuccessPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
