import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  
  fullname: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  birthDate: string = '';
  showPassword: boolean = false;
  isValid: boolean = false;

  emailError: boolean = false;
  usernameError: boolean = false;
  passwordError: boolean = false;
  passwordMismatch: boolean = false;
  birthDateError: boolean = false;
  users: any[] = []; // Array donde se guardarán los usuarios registrados

  constructor(private alertCtrl: AlertController) {}

  validateInputs() {
    this.fullname = this.fullname.toUpperCase();
    
    this.emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    this.usernameError = /\s/.test(this.username);
    this.passwordError = this.password.length < 6 || /\s/.test(this.password);
    this.passwordMismatch = this.password !== this.confirmPassword;
    this.birthDateError = this.birthDate.trim().length === 0;

    // Validar si todo es correcto
    this.isValid = !this.emailError && !this.usernameError && !this.passwordError && !this.passwordMismatch && !this.birthDateError;
  }

  async onSubmit() {
    if (!this.isValid) {
      return;
    }

    // Guardar usuario en el array
    this.users.push({
      fullname: this.fullname,
      email: this.email,
      username: this.username,
      birthDate: this.birthDate
    });

    const alert = await this.alertCtrl.create({
      header: 'Registro Exitoso',
      message: `Usuario registrado correctamente.`,
      buttons: ['OK'],
    });
    await alert.present();

    // Limpiar formulario
    this.fullname = '';
    this.email = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.birthDate = '';
    this.isValid = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
