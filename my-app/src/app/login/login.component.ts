import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from '../app.component';

import { UserService } from '../user.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LoginComponent implements OnInit {

  userError: boolean = false;
  passwordError: boolean = false;

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
      },
      err => {
        if (err) {
          this.passwordError = true;
        }
      }
    );
  }

  ngOnInit(): void {
  }
}
