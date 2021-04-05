import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class qualificationsService {

  url = `${environment.apiUrl}`; // http://localhost:4200/qualifications

  constructor(private http: HttpClient) { }

  submitQualifications(data) {
    return this.http.post(`${environment.apiUrl}/api/courses-insert-qualifications`, data);
  }
}