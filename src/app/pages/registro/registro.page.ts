import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  registroForm: FormGroup;
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private alertCtrl: AlertController, private route: Router, private authService: AuthService, private navCtrl: NavController) {
    this.registroForm = this.fb.group({
      fullname: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]
      ],
      username: [
        '',
        [Validators.required, Validators.pattern(/^\S*$/)]
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.pattern(/^\S*$/)]
      ],
      confirmPassword: [
        '',
        [Validators.required, Validators.minLength(6), Validators.pattern(/^\S*$/)]
      ],
      birthDate: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
  }

  get passwordsDoNotMatch(): boolean {
    return !!this.registroForm.hasError('passwordsMismatch') &&
      !!this.registroForm.get('confirmPassword')?.touched;
  }

  convertToUppercase() {
    const fullNameControl = this.registroForm.get('fullname');
    if (fullNameControl) {
      const currentValue = fullNameControl.value || '';
      const upperValue = currentValue.toUpperCase();
      if (currentValue !== upperValue) {
        fullNameControl.setValue(upperValue, { emitEvent: false });
      }
    }
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      console.log('Formulario inválido');
      return;
    }

    const { email, username, password, confirmPassword } = this.registroForm.value;

    if (password !== confirmPassword) {
      console.log('Las contraseñas no coinciden');
      return;
    }

    const result = await this.authService.registerUser(email, username, password);
    if (result.success) {
      console.log('Registro exitoso');
      this.navCtrl.navigateRoot('/login'); // Redirigir a login
    } else {
      console.log('Error en registro:', result.message);
    }
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToLogin() {
    this.route.navigate(['/login']);
  }

}