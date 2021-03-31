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

  message = undefined;
  userError: boolean = false;
  passwordError: boolean = false;
  signup = false;

  test = ['bruh', 'bruh2'];

  constructor(
    private userService: UserService,
    private router: Router,
    private appComponent: AppComponent
  ) { }

  login(): boolean {
    let username = (document.getElementById("login-username") as HTMLInputElement).value;
    let password = (document.getElementById("login-password") as HTMLInputElement).value;

    if (username === "" || password === "") return;

    this.userService.login(username, password).subscribe(
      data => {
        this.userService.setToken(data);
        this.passwordError = false;
        this.message = undefined;
        setTimeout(() => window.location.reload(), 500)
      },
      err => {
        if (err.error.message) this.message = err.error.message;
        else if (err) this.passwordError = true;
      }
    );
  }

  clickSignup() {
    this.signup = !this.signup;
  }

  ngOnInit(): void { }
}
