import { Component } from '@angular/core';
import { Firestore, collection, getDocs, setDoc, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { encryptData } from '../../utils/encryption';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage {
  activeTab = 'list'; // Tab por defecto
  users: any[] = [];
  newUser = { email: '', username: '', password: '' };
  selectedUser: any = null; // 🔹 Inicializado en `null` en lugar de `undefined`

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private route: Router,
    private toastCtrl: ToastController
  ) {
    (window as any).encryptRoleForFirestore = this.encryptRoleForFirestore.bind(this);
  }

  async ionViewWillEnter() {
    this.loadUsers();
  }

  async loadUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addUser() {
    if (!this.newUser.email || !this.newUser.username || !this.newUser.password) {
      this.showToast('Todos los campos son obligatorios.');
      return;
    }

    try {
      const encryptedPassword = await encryptData(this.newUser.password);
      const encryptedRole = await encryptData('user'); // Asignar rol por defecto "user"

      const userDoc = doc(this.firestore, 'users', this.newUser.email);
      await setDoc(userDoc, {
        email: this.newUser.email,
        username: this.newUser.username,
        password: encryptedPassword,
        role: encryptedRole,
        permissions: [],
        last_login: new Date()
      });

      this.showToast('Usuario agregado exitosamente.');
      this.newUser = { email: '', username: '', password: '' };
      this.loadUsers(); // Refrescar la lista de usuarios
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      this.showToast('Error al agregar usuario.');
    }
  }

  async updateUser() {
    if (!this.selectedUser) {
      console.warn('No hay usuario seleccionado para modificar.');
      return;
    }

    try {
      const userDoc = doc(this.firestore, 'users', this.selectedUser.id);
      await updateDoc(userDoc, {
        username: this.selectedUser.username,
        email: this.selectedUser.email
      });

      console.log('Usuario actualizado exitosamente.');
      this.loadUsers(); // Refrescar la lista de usuarios
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
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
