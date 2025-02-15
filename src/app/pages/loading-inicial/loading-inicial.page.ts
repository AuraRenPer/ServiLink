import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-inicial',
  standalone: false,
  templateUrl: './loading-inicial.page.html',
  styleUrls: ['./loading-inicial.page.scss'],
})
export class LoadingInicialPage {
  @Input() nextRoute: string = '/login'; // Ruta de destino
}
