import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDocs, getDoc, collection, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { encryptData } from '../utils/encryption';
import { JwtHelperService } from '@auth0/angular-jwt';
import { decryptData } from '../utils/encryption';
import { signOut } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth); // ✅ Se inyecta correctamente
  private firestore = inject(Firestore);
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);

  async registerUser(email: string, username: string, password: string) {
    try {
      // 1️⃣ Verificar si el correo ya está en uso en Firestore
      const usersRef = collection(this.firestore, 'users');
      const existingUserQuery = query(usersRef, where('email', '==', email));
      const existingUserSnapshot = await getDocs(existingUserQuery);

      if (!existingUserSnapshot.empty) {
        return { success: false, message: 'Este correo ya está registrado. Intenta iniciar sesión.' };
      }

      // 2️⃣ Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // 3️⃣ Obtener rol y permisos
      const rolesRef = collection(this.firestore, 'roles');
      const q = query(rolesRef, where('role', '==', 'user'));
      const querySnapshot = await getDocs(q);

      let role = 'user';
      let permissions: string[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        role = data['role'];
        permissions = data['permissions'];
      });

      // 4️⃣ Guardar usuario en Firestore
      await setDoc(doc(this.firestore, 'users', uid), {
        email,
        username,
        password: await encryptData(password),  // ✅ Cifrar antes de guardar
        role: await encryptData(role),  // ✅ Cifrar antes de guardar
        permissions,
        last_login: new Date()
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Error en registro:', error);

      let errorMessage = 'Ocurrió un error desconocido';

      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, message: errorMessage };
    }
  }

  async loginUser(email: string, password: string) {
    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // Obtener datos del usuario desde Firestore
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDocSnap.data();
      const decryptedRole = decryptData(userData['role']);
      const decryptedPermissions = userData['permissions'];
     

      // Generar un token con rol y permisos
      const tokenPayload = {
        uid: uid,
        email: email,
        role: decryptedRole,
        permissions: decryptedPermissions,
        exp: Math.floor(Date.now() / 1000) + 3600 // Expira en 1 hora
      };
      
      const token = this.generateToken(tokenPayload);
      localStorage.setItem('authToken', token);

      return { success: true, token };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: (error as any).message };
    }
  }

  logout() {
    signOut(this.auth);
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  private generateToken(payload: any): string {
    return btoa(JSON.stringify(payload)); // Codificar en Base64 (se recomienda usar JWT real en producción)
  }
}
