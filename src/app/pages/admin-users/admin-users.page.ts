import { Component } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage {
  users: any[] = [];

  constructor(private firestore: Firestore) {}

  async ionViewWillEnter() {
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    this.users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
