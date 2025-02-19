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
  roles: any[] = [];
  selectedPermissionsAdd: string[] = [];
  selectedPermissionsEdit: string[] = [];
  editForm!: FormGroup;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private route: Router,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private navCtrl: NavController
  ) {
    (window as any).encryptRoleForFirestore = this.encryptRoleForFirestore.bind(this);
    // form de registro
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
      birthDate: ['', [Validators.required]],
      role: ['', Validators.required],
      permissions: [[]]
    }, { validators: this.passwordsMatch });

    this.editForm = this.fb.group({
      selectedUser: ['', Validators.required],
      fullname: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]
      ],
      username: [
        '',
        [Validators.required, Validators.pattern(/^\S*$/)]
      ],
      role: ['', Validators.required], // Asegurar que el rol se actualiza bien
      permissions: [[]] // Asegurar que los permisos siempre se asignan
    });

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
    await this.loadRoles();
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

    const { email, username, password, confirmPassword, role, permissions } = this.registroForm.value;

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
        permissions,
        last_login: new Date()
      });

      this.showToast('Usuario agregado exitosamente.');

      // Se limpia el formulario después de agregar el usuario
      this.registroForm.reset();
      this.registroForm.markAsUntouched();
      this.loadUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      this.showToast('Error al agregar usuario.');
    }
  }

  onUserSelect(event: any) {
    const selectedUser = event.detail.value;
    this.selectedUser = selectedUser; // Almacenar usuario seleccionado

    this.editForm.patchValue({
      email: selectedUser.email,
      username: selectedUser.username,
      role: selectedUser.role,
      permissions: selectedUser.permissions || []
    });

    // Cargar permisos relacionados con el rol seleccionado
    this.onRoleChange({ detail: { value: selectedUser.role } }, 'edit');
  }


  async updateUser() {
    if (this.editForm.invalid) {
      this.showToast('Por favor, complete todos los campos correctamente.');
      return;
    }

    const { email, username, role, permissions } = this.editForm.value;

    try {
      const encryptedRole = await encryptData(role);

      const userDoc = doc(this.firestore, 'users', this.selectedUser.id);
      await updateDoc(userDoc, {
        email,
        username,
        role: encryptedRole,
        permissions
      });

      this.showToast('Usuario actualizado exitosamente.');
      this.editForm.reset();
      this.loadUsers();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      this.showToast('Error al actualizar usuario.');
    }
  }

  async populateEditForm() {
    if (this.selectedUser) {
      this.editForm.setValue({
        email: this.selectedUser.email,
        fullname: this.selectedUser.fullname || '',
        username: this.selectedUser.username,
        birthDate: this.selectedUser.birthDate || ''
      });
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: message.includes('❌') ? 'danger' : 'success'
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

  // Roles
  async loadRoles() {
    const rolesCollection = collection(this.firestore, 'roles');
    const rolesSnapshot = await getDocs(rolesCollection);

    this.roles = [];

    for (const docSnap of rolesSnapshot.docs) {
      let roleData = docSnap.data();

      // 🔹 Agregar roles con permisos a la lista
      this.roles.push({
        role: roleData['role'],
        permissions: roleData['permissions'] || []
      });
    }

    console.log('Roles cargados:', this.roles); // 📌 Verificar que los roles se están cargando
  }


  // Cargar permisos automáticamente según el rol seleccionado
  onRoleChange(event: any, formType: string) {
    const selectedRole = event.detail.value;

    const foundRole = this.roles.find(role => role.role === selectedRole);
    const permissions = foundRole ? foundRole.permissions : [];

    if (formType === 'add') {
      this.selectedPermissionsAdd = permissions;
      this.registroForm.controls['permissions'].setValue(permissions);
    } else if (formType === 'edit') {
      this.selectedPermissionsEdit = permissions;
      this.editForm.controls['permissions'].setValue(permissions);
    }
  }

}
