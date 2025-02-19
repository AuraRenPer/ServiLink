import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { decryptData } from '../../utils/encryption';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  user: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  async ionViewWillEnter() { // Se ejecuta cada vez que se entra en esta vista
    await this.loadUserData();
  }

  async loadUserData() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = JSON.parse(atob(token));
  
      console.log('Token Decodificado antes de desencriptar:', decodedToken); 
  
      // Verificar si el role está cifrado antes de intentar desencriptarlo
      this.user = decodedToken;
      console.log('Usuario Cargado:', this.user);
      
  
      this.user = decodedToken;
      console.log('Usuario Cargado después de desencriptar:', this.user); 
    } else {
      console.warn("No hay un token de autenticación almacenado.");
      this.router.navigate(['/login']); // Redirigir a login si no hay token
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }
}
