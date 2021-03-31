import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from '../app.component';

import { UserService } from '../user.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  userError: boolean = false;
  passwordError: boolean = false;

  test = ['bruh', 'bruh2'];

  constructor(
    private userService: UserService,
    private router: Router,
    private appComponent: AppComponent
  ) { }

  login() {
    let username = (document.getElementById("login-username") as HTMLInputElement).value;
    let password = (document.getElementById("login-password") as HTMLInputElement).value;

    if (username === "" || password === "") return;

    this.userService.login(username, password).subscribe(
      data => {
        this.userService.setToken(data);
        this.passwordError = false;
        this.redirectHome();
      },
      err => {
        if (err) this.passwordError = true;
      }
    );
  }

  redirectHome() {
    setTimeout(() => this.router.navigate(['/']), 1000);
  }

  ngOnInit(): void { }
}
