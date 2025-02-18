import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  user: any;

  constructor(private authService: AuthService) {
    this.loadUserData();
  }

  loadUserData() {
    const token = this.authService.getToken();
    if (token) {
      this.user = JSON.parse(atob(token));
    }
  }
}
