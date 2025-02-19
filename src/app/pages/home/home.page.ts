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

  constructor(private authService: AuthService, private router: Router) {
    this.loadUserData();
  }

  async loadUserData() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = JSON.parse(atob(token));
  
      console.log('Token Decodificado antes de desencriptar:', decodedToken); 
  
      //Verificar si el role está cifrado antes de intentar desencriptarlo
      if (typeof decodedToken.role === 'string' && decodedToken.role.includes(':')) {
        decodedToken.role = await decryptData(decodedToken.role);
      } else {
        console.warn('El role no está cifrado o tiene un formato incorrecto:', decodedToken.role);
      }
  
      this.user = decodedToken;
      console.log('Usuario Cargado después de desencriptar:', this.user); 
    }
  }
  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }
}
