import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../require-tapositions/require-tapositions.component';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { courseinteface } from './coursehours'
import { environment } from '../../environments/environment';
import { UserService } from '../user.service';

@Injectable()
export class courseService {


private getcourseurl: string = `${environment.apiUrl}/api/getcoursehours`;
private postcourseurl: string = `${environment.apiUrl}/api/replacecoursehours`;

constructor(
  private userService: UserService,
  private http: HttpClient) { }

postHours(pdn) {
return this.http.post(this.postcourseurl, pdn,  { headers: this.userService.getAuthorizationHeader() }).toPromise().then(data => {
  console.log(data);
});
    }

getHours(): Observable<courseinteface[]> {
return this.http.get<courseinteface[]>(this.getcourseurl, { headers: this.userService.getAuthorizationHeader() });
    }


}

@Component({
  selector: 'app-adjust-coursehours',
  templateUrl: './adjust-coursehours.component.html',
  styleUrls: ['./adjust-coursehours.component.css']
})
export class AdjustCoursehoursComponent implements OnInit {

  courses = [];
  display = [];

  constructor(private _courseservice:courseService) { }

  ngOnInit(): void {
    this._courseservice.getHours().subscribe((data) => this.courses = data);
  }

  displayCourse(){ 
    this.display = [];
    for (var key in this.courses) {
      this.display.push(this.courses[key])
    }
  }

  searchCourse(){ 
    let courseName = (document.getElementById("courseName") as HTMLInputElement).value; 
    let newCoursehours = (document.getElementById("newCoursehours") as HTMLInputElement).value;
    let found = false; 

    //handle eventS where a box was not filled
    if (!courseName) {
      alert("Please input the name of the course")
     }

    else if(!newCoursehours) {  
      alert("Please input a number for the new course hours")
     }

     //if everything is filled out 
     else  {
      for (var key in this.courses) {
       
    
        if (courseName.toLowerCase() == this.courses[key].course.toLowerCase()) {
          //TA with that name and course was found

          //now do post request that replaces the tas hours
           this.courses[key].hours = newCoursehours;
           found = true;

           let postData = {
            course : this.courses[key].course,
            hours : this.courses[key].hours,
           } 
           this._courseservice.postHours(postData);  }

     }
     //handle situation where the course or the TA is not found
     if(found == false) {
      alert("Sorry that course was not found")
     }

    }

  }


}
