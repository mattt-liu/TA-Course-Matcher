import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(
    private userService: UserService,
    private http: HttpClient) { }

  createQuestions(data) {
    return this.http.post(`${environment.apiUrl}/api/courses-ml`, data,  { headers: this.userService.getAuthorizationHeader() });
  }

  getQuestions(){
    return this.http.get(`${environment.apiUrl}/api/getquestions`,  { headers: this.userService.getAuthorizationHeader() });
  }
}
