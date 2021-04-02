import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
    selector: 'app-user-admin',
    templateUrl: './user-admin.component.html',
    styleUrls: ['./user-admin.component.css']
})
export class UserAdminComponent implements OnInit {

    users = undefined;
    expand: boolean[] = undefined;
    error: boolean = false;

    constructor(
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.getUsers();
    }

    getUsers() {
        return this.userService.getUsers().subscribe(data => {
            this.users = data;
            this.error = false;
            this.fillExpand();
        }, err => {
            this.users = undefined;
            this.error = true;
            if (err.error) {
            }
        })
    }

    verifyUser(email) {
        this.userService.verifyUser(email).subscribe(data => {
            setTimeout(() => window.location.reload(), 100);
        }, err => {});
    }

    fillExpand() {
        this.expand = [];
        for (let i = 0; i < this.users.length; i++) {
            this.expand.push(false);
        }
    }
}
