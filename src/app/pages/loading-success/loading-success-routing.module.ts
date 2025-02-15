import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadingSuccessPage } from './loading-success.page';

const routes: Routes = [
  {
    path: '',
    component: LoadingSuccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadingSuccessPageRoutingModule {}
