import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// author: Pérez Ugalde Aura Renata
@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent  implements OnInit {
  fadeOut = false; 
  @Input() nextRoute: string = '/login';
  constructor(private router: Router) {}

  ngOnInit() {
    this.startLoading();
  }

  startLoading() {
    setTimeout(() => {
      this.fadeOut = true;
      setTimeout(() => {
        this.router.navigate(['/login']); 
      }, 1000); 
    }, 3000); 
  }
}
