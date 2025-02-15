import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadingInicialPage } from './loading-inicial.page';

const routes: Routes = [
  {
    path: '',
    component: LoadingInicialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadingInicialPageRoutingModule {}
