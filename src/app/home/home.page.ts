import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  username: string = '';
  password: string = '';
  isValid: boolean = false;
  showModal: boolean = false;

  constructor(private alertCtrl: AlertController) {}

  // Validar inputs
  validateInputs() {
    this.username = this.username.toLowerCase(); // Convertir a minúsculas
    const usernameValid = this.username.trim().length > 0 && !/\s/.test(this.username);
    const passwordValid = this.password.trim().length > 0 && !/\s/.test(this.password);
    this.isValid = usernameValid && passwordValid;
  }

  // Función para iniciar sesión
  async iniciarSesion() {
    if (this.isValid) {
      const alert = await this.alertCtrl.create({
        header: 'Inicio de sesión exitoso',
        message: `Bienvenido, Username: ${this.username}, Password: ${this.password}`,
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor, ingresa un usuario y contraseña válidos.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  // Abrir modal para mostrar los datos ingresados
  openModal() {
    this.showModal = true;
  }

  // Cerrar modal
  closeModal() {
    this.showModal = false;
  }
}
