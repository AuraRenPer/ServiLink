import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { Router } from '@angular/router';
import { encryptData } from '../utils/encryption'; // Agregaremos una función para cifrar

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  async registerUser(email: string, username: string, password: string) {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // Buscar el rol "user" por defecto en Firestore
      const rolesRef = collection(this.firestore, 'roles');
      const q = query(rolesRef, where('role', '==', 'user'));
      const querySnapshot = await getDocs(q);

      let role = 'user'; // Si no existe un rol en Firestore, asignamos "user"
      let permissions: string[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data(); // Extraemos los datos una vez para evitar llamadas repetitivas
        role = data['role']; // Acceder con notación de corchetes
        permissions = data['permissions'];
      });
      

      // Cifrar la contraseña y el rol
      const encryptedPassword = encryptData(password);
      const encryptedRole = encryptData(role);

      // Guardar datos del usuario en Firestore
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
        errorMessage = error.message;
      }
    
      return { success: false, message: errorMessage };
    }
  }    
}
