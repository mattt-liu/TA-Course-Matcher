import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class qualificationsService {

  url = "localhost:3000"; // http://localhost:4200/qualifications

  constructor(private http: HttpClient) { }

  submitQualifications(data) {
    return this.http.post(`http://localhost:3000/api/courses-insert-qualifications`, data);
  }
}