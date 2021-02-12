import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  createQuestions(data) {
    if (environment.production) return this.http.post(`/api/courses-ml`, data);
    return this.http.post(`${environment.apiUrl}/api/courses-ml`, data);
  }
}
