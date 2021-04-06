import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	user = undefined;
	showlogin: boolean = false;

	constructor(
		private userService: UserService,
	) { }

	ngOnInit(): void {
		this.checkLogin();
	}

	checkLogin() {
		if (!localStorage.getItem('token')) return;
		this.userService.getEmail().subscribe(data => {
			this.showlogin = false;
			this.user = data;
		}, err => {
			this.user = undefined;
			this.userService.logout();
		});
	}

	login() {
		this.showlogin = !this.showlogin;
	}

	logout() {
		this.userService.logout();
		this.user = undefined;
        setTimeout(() => window.location.reload(), 100);
	}

	public getUser() {
		return new Promise((resolve, reject) => {
			if (!localStorage.getItem('token')) resolve(undefined);
			this.userService.getEmail().subscribe(data => {
				resolve(data);
			}, err => {
				reject(err);
			});
		})
	}
}
