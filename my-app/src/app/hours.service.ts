import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class HoursService {

  constructor(
    private userService: UserService,
    private http: HttpClient) { }

  allocateHours(data) {
    return this.http.post(`${environment.apiUrl}/api/coursehours`, data,  { headers: this.userService.getAuthorizationHeader() });
  }
}
