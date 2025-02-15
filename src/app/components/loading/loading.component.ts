import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent  implements OnInit {
  fadeOut = false; // Controla el sombreado
  @Input() nextRoute: string = '/login';
  constructor(private router: Router) {}

  ngOnInit() {
    this.startLoading();
  }

  startLoading() {
    setTimeout(() => {
      this.fadeOut = true; // Activa el sombreado
      setTimeout(() => {
        this.router.navigate(['/login']); // Redirige después del sombreado
      }, 1000); // Se espera 1s para que termine la animación
    }, 3000); // Se espera 3s antes de activar el sombreado
  }
}
