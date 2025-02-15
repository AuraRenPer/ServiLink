import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent  implements OnInit {
  @Input() nextRoute: string = '/login'; // Ruta de destino, por defecto a login

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate([this.nextRoute]); // Redirige a la ruta indicada
    }, 3000);
  }

}
