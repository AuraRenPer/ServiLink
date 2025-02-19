import { Component } from '@angular/core';
import { Firestore, collection, getDocs, setDoc, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { encryptData, decryptData } from '../../utils/encryption';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';


@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage {
  registroForm: FormGroup;
  showPassword: boolean = false;
  activeTab = 'list'; // Tab por defecto
  users: any[] = [];
  newUser = { email: '', username: '', password: '' };
  selectedUser: any = null;
  currentUser: any = {};

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private route: Router,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private navCtrl: NavController
  ) {
    (window as any).encryptRoleForFirestore = this.encryptRoleForFirestore.bind(this);
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  async ionViewWillEnter() {
    await this.loadUsers();
    this.loadCurrentUser();
  }

  async loadUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = [];

    for (const docSnap of usersSnapshot.docs) {
      let userData = docSnap.data();

      // 🔹 Desencriptar `role`
      const decryptedRole = await decryptData(userData['role']);

      // 🔹 Convertir `last_login` a una fecha legible
      let lastLoginFormatted = 'No disponible';
      if (userData['last_login'] && userData['last_login'].seconds) {
        lastLoginFormatted = new Date(userData['last_login'].seconds * 1000).toLocaleString();
      }

      this.users.push({
        id: docSnap.id,
        username: userData['username'],
        email: userData['email'],
        role: decryptedRole,  // ✅ Ahora se mostrará como "master" o "user"
        last_login: lastLoginFormatted,  // ✅ Ahora se muestra en formato de fecha legible
        showDetails: false
      });
    }
  }

  async loadCurrentUser() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = JSON.parse(atob(token));

      // 🔹 Desencriptar el role del usuario en sesión
      decodedToken.role = await decryptData(decodedToken.role);

      this.currentUser = decodedToken;
    }
  }

  toggleUserDetails(user: any) {
    user.showDetails = !user.showDetails;
  }

  async addUser() {
    if (this.registroForm.invalid) {
      this.showToast('Por favor, complete todos los campos correctamente.');
      return;
    }

    const { email, username, password, confirmPassword } = this.registroForm.value;

    if (password !== confirmPassword) {
      this.showToast('Las contraseñas no coinciden.');
      return;
    }

    try {
      const encryptedPassword = await encryptData(password);
      const encryptedRole = await encryptData('user'); // Por defecto, el nuevo usuario es "user"

      const userDoc = doc(this.firestore, 'users', email);
      await setDoc(userDoc, {
        email,
        username,
        password: encryptedPassword,
        role: encryptedRole,
        permissions: [],
        last_login: new Date()
      });

      this.showToast('Usuario agregado exitosamente.');

      // 🔹 Limpiar el formulario después de agregar el usuario
      this.registroForm.reset();
      this.registroForm.markAsUntouched();
      this.loadUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      this.showToast('Error al agregar usuario.');
    }
  }


  async updateUser() {
    if (!this.selectedUser) {
      this.showToast('Selecciona un usuario para modificar.');
      return;
    }

    try {
      const userDoc = doc(this.firestore, 'users', this.selectedUser.id);
      await updateDoc(userDoc, {
        username: this.selectedUser.username,
        email: this.selectedUser.email
      });

      this.showToast('Usuario actualizado exitosamente.');
      this.selectedUser = null; // 🔹 Limpiar el formulario de modificación
      await this.loadUsers(); // 🔹 Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      this.showToast('Error al actualizar usuario.');
    }
  }


  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }


  async encryptRoleForFirestore() {
    const encryptedRole = await encryptData('master');
    console.log('Rol cifrado:', encryptedRole);
  }

  regresar() {
    this.route.navigate(['/home']);
  }
}
