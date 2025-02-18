import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDocs, collection, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { encryptData } from '../utils/encryption';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth); // ✅ Se inyecta correctamente
  private firestore = inject(Firestore);
  private router = inject(Router);

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

      // 4️⃣ Guardar usuario en Firestore (sin contraseña)
      await setDoc(doc(this.firestore, 'users', uid), {
        email,
        username,
        role, // ⚠️ No es necesario encriptarlo, Firestore ya es seguro
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
}
