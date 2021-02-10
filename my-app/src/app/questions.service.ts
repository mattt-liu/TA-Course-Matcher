import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  url = "localhost:3000"; // http://localhost:4200/questions

  constructor(private http: HttpClient) { }

  createQuestions(data) {
    return this.http.post(`http://localhost:3000/api/courses-ml`, data);
  }

  test() {
    return this.http.get("localhost:3000/api/test");
  }
}
