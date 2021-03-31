import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  error: boolean = false;
  message = undefined;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
  }
  signup() {
    let username = (document.getElementById("signup-username") as HTMLInputElement).value;
    let password = (document.getElementById("signup-password") as HTMLInputElement).value;

    if (username === "" || password === "") return;

    this.userService.signup(username, password).subscribe(
      data => {
        this.message = undefined;
        this.error = false;
        setTimeout(() => window.location.reload(), 500)
      },
      err => {
        if (err.error.message) {
          this.message = err.error.message;
        }
        else {
          this.error = true;
        }
      }
    );
  }
}
