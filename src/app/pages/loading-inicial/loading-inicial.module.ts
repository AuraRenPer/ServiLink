import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingInicialPageRoutingModule } from './loading-inicial-routing.module';
import { LoadingInicialPage } from './loading-inicial.page';
import { ComponentsModule } from '../../components/components.module'; // Importa el módulo de componentes

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingInicialPageRoutingModule,
    ComponentsModule 
  ],
  declarations: [LoadingInicialPage]
})
export class LoadingInicialPageModule {}
