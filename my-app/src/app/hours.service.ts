import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HoursService {

  constructor(private http: HttpClient) { }

  allocateHours(data) {
    if (environment.production) return this.http.post(`/api/coursehours`, data);
    return this.http.post(`${environment.apiUrl}/api/coursehours`, data);
  }
}
