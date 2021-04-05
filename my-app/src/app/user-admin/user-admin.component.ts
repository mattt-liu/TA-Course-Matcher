import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-admin',
    templateUrl: './user-admin.component.html',
    styleUrls: ['./user-admin.component.css']
})
export class UserAdminComponent implements OnInit {

    users = undefined;
    expand: boolean[] = undefined;
    error: boolean = false;
    instructors = undefined;
    instructor = undefined;

    constructor(
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.getUsers();
        this.getInstructors();
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
        }, err => { });
    }

    getInstructors() {
        this.userService.getInstructors().subscribe(data => {
            this.instructors = data;
        }, err => {
            this.instructors = undefined;
        });
    }

    fillExpand() {
        this.expand = [];
        for (let i = 0; i < this.users.length; i++) {
            this.expand.push(false);
        }
    }
    showInstructor() {
        let dropdownChoice = (document.getElementById("dropdown") as HTMLInputElement).value;

        if (dropdownChoice === "") return this.instructor = undefined;
        for (let i of this.instructors) {
            if (i.instructor === dropdownChoice) {
                this.instructor = i;
            }
        }
    }
    addCourse() {
        let courseInput = (document.getElementById("course") as HTMLInputElement).value;

        let body = {
            instructor: this.instructor.instructor,
            course: courseInput
        }

        this.userService.addInstructorCourse(body).subscribe(() => {
            this.cancelCourse();
        });
    }
    cancelCourse() {
        (document.getElementById("dropdown") as HTMLInputElement).value = "";
        this.instructor = undefined;
        setTimeout(() => window.location.reload(), 100);
    }
}
