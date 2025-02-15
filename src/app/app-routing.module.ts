import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// author: Pérez Ugalde Aura Renata
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
