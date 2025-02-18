import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  user: any;

  constructor(private authService: AuthService, private router: Router) {
    this.loadUserData();
  }

  loadUserData() {
    const token = this.authService.getToken();
    if (token) {
      this.user = JSON.parse(atob(token));
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
  }
}
