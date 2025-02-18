import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // Asegúrate de que el path sea correcto

//author: Pérez Ugalde Aura Renata
@Component({
  selector: 'app-home',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class HomePage {
  username: string = '';
  password: string = '';
  isValid: boolean = false;
  showModal: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private route: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  validateInputs() {
    this.username = this.username.toLowerCase();
    const usernameValid = this.username.trim().length > 0 && !/\s/.test(this.username);
    const passwordValid = this.password.trim().length > 0 && !/\s/.test(this.password);
    this.isValid = usernameValid && passwordValid;
  }

  async iniciarSesion() {
    if (!this.isValid) {
      this.showToast('Por favor, ingresa un usuario y contraseña válidos.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'circles',
    });

    await loading.present();

    try {
      const result = await this.authService.loginUser(this.username, this.password);

      if (result.success) {
        this.showToast('Inicio de sesión exitoso.');
        this.route.navigate(['/home']); // Redirigir a la página principal
      } else {
        this.showToast(result.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.showToast('Ocurrió un error inesperado.');
    } finally {
      loading.dismiss();
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }

  goRegister() {
    this.route.navigate(['/registro']);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
