import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading-success',
  standalone: false,
  templateUrl: './loading-success.page.html',
  styleUrls: ['./loading-success.page.scss'],
})
export class LoadingSuccessPage implements OnInit {
  progress = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startLoading();
  }

  startLoading() {
    let interval = setInterval(() => {
      this.progress += 0.1;
      if (this.progress >= 1) {
        clearInterval(interval);
        this.router.navigate(['/home']); 
      }
    }, 300);
  }
}
