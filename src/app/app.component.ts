import { Component, inject } from '@angular/core';
import { FirebaseApp, getApp } from '@angular/fire/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private firebaseApp = inject(FirebaseApp);
  constructor() {
    const app = getApp();
    console.log('🔥 Firebase App:', app.name);
  }
}
