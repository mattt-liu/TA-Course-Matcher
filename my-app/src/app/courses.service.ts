import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(private http: HttpClient) { }

  allocateHours(data) {
    if (environment.production) return this.http.post(`/api/coursehours`, data);
    return this.http.post(`${environment.apiUrl}/api/coursehours`, data);
  }

  getCourseData() {
    return this.http.get(`${environment.apiUrl}/api/getcourses`);
  }

  assignApplicantRankings(name, body) {
    /*
    body = {
			course: 
			hours: 
    }
    */
    return this.http.post(`${environment.apiUrl}/api/applicant-rankings/${name}`, body);
  }
  
  assignInstructoryRankings(course, body) {
    /*
    body = {
			name: 
			hours: 
    }
    */
    return this.http.post(`${environment.apiUrl}/api/instructor-rankings/${course}`, body);
  }

  getApplicantRankings(name){
    return this.http.get(`${environment.apiUrl}/api/applicant-rankings/${name}`);
  }

  getInstructorRankings(course){
    return this.http.get(`${environment.apiUrl}/api/instructor-rankings/${course}`);
  }

  addCourse(course) {
    return this.http.post(`${environment.apiUrl}/api/course-data`, course);
  }

  requires(course) {
    return this.http.post(`${environment.apiUrl}/api/getcourses`, course);
  }
}
