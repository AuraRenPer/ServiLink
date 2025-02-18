import { Component, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private firebaseApp: FirebaseApp) {
    console.log('🔥 Firebase App:', this.firebaseApp.name);
  }
}
