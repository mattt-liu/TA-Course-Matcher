import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	user = undefined;

	constructor(
		private userService: UserService,
	) { }

	ngOnInit(): void {
		this.checkLogin();
	}

	checkLogin() {
		this.userService.getEmail().subscribe(data => {
			this.user = data;
		},
			err => {
				this.user = undefined;
			});
	}

	logout() {
		console.log("LOGOUT");
		this.userService.logout();
		this.user = undefined;
	}
}
