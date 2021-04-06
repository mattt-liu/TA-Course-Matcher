import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(
    private userService: UserService,
    private http: HttpClient
    ) { }

  allocateHours(data) {
    if (environment.production) return this.http.post(`/api/coursehours`, data);
    return this.http.post(`${environment.apiUrl}/api/coursehours`, data);
  }

  getCourseData() {
    return this.http.get(`${environment.apiUrl}/api/getcourses`,  { headers: this.userService.getAuthorizationHeader() });
  }

  assignApplicantRankings(name, body) {
    /*
    body = {
			course: 
			hours: 
    }
    */
    return this.http.post(`${environment.apiUrl}/api/applicant-rankings/${name}`, body,  { headers: this.userService.getAuthorizationHeader() });
  }
  
  assignInstructoryRankings(course, body) {
    /*
    body = {
			name: 
			hours: 
    }
    */
    return this.http.post(`${environment.apiUrl}/api/instructor-rankings/${course}`, body,  { headers: this.userService.getAuthorizationHeader() });
  }

  getApplicantRankings(name){
    return this.http.get(`${environment.apiUrl}/api/applicant-rankings/${name}`,  { headers: this.userService.getAuthorizationHeader() });
  }

  getInstructorRankings(course){
    return this.http.get(`${environment.apiUrl}/api/instructor-rankings/${course}`,  { headers: this.userService.getAuthorizationHeader() });
  }

  addCourse(course) {
    return this.http.post(`${environment.apiUrl}/api/course-data`, course,  { headers: this.userService.getAuthorizationHeader() });
  }

  requires(course) {
    return this.http.post(`${environment.apiUrl}/api/getcourses`, course,  { headers: this.userService.getAuthorizationHeader() });
  }
}
