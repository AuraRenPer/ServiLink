import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDocs, getDoc, collection, query, where, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { encryptData, decryptData } from '../utils/encryption';
import { JwtHelperService } from '@auth0/angular-jwt';
import { signOut } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);

  async registerUser(email: string, username: string, password: string) {
    try {
      // Verificar si hay usuarios registrados en Firestore
      const usersRef = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);

      let role = 'user'; // Por defecto, los nuevos usuarios serán "user"

      if (usersSnapshot.empty) {
        role = 'master'; // Si no hay usuarios registrados, el primer usuario será "master"
      }

      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // Obtener permisos del rol desde Firestore
      const rolesRef = collection(this.firestore, 'roles');
      const q = query(rolesRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);

      let permissions: string[] = [];

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        permissions = data['permissions'] ?? [];
      }

      // Cifrar la contraseña y el rol
      const encryptedPassword = await encryptData(password);
      const encryptedRole = await encryptData(role);

      // Guardar usuario en Firestore
      await setDoc(doc(this.firestore, 'users', uid), {
        email,
        username,
        password: encryptedPassword,
        role: encryptedRole,
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
        } else if (error.message.includes('auth/weak-password')) {
          errorMessage = 'La contraseña es demasiado débil. Intenta con una más segura.';
        } else if (error.message.includes('auth/invalid-email')) {
          errorMessage = 'El formato del correo no es válido.';
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, message: errorMessage };
    }
  }


  async loginUser(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      const userDocRef = doc(this.firestore, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDocSnap.data();

      // Actualizar `last_login`
      const newLoginTimestamp = Timestamp.now();
      await updateDoc(userDocRef, { last_login: newLoginTimestamp });

      // Desencriptar `role`
      const decryptedRole = await decryptData(userData['role']);
      const permissions = userData['permissions'] || [];

      // Convertir `last_login` a formato legible
      const lastLoginFormatted = newLoginTimestamp.toDate().toLocaleString();

      // Construir el token antes de encriptarlo
      const tokenPayload = {
        uid,
        email,
        username: userData['username'],
        last_login: lastLoginFormatted,
        role: decryptedRole, // ✅ Ya desencriptado
        permissions,
        exp: Math.floor(Date.now() / 1000) + 3600 // Expira en 1 hora
      };

      console.log("Token Antes de Encriptar:", tokenPayload); 

      // Se encripta el token antes de guardarlo
      const token = btoa(JSON.stringify(tokenPayload));
      localStorage.setItem('authToken', token);

      console.log("Token Encriptado:", token); 

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

  getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    console.log("Token Encriptado Recuperado:", token); // 📌 Verificar en consola

    try {
        const decodedToken = JSON.parse(atob(token));

        console.log("Token Desencriptado:", decodedToken); // 📌 Verificar en consola después de desencriptar

        return decodedToken;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
}

}
