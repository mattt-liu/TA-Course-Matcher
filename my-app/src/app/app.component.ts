import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { courses } from './require-tapositions/needsTAs';

 @Injectable()  
export class ConfigService {

// private linkstring: string = "http://localhost:3000/courses-ml";

// constructor(private http: HttpClient) { }
   
  
// getcourses(): Observable<courses[]> {
// return this.http.get<courses[]>(this.linkstring);
//     }
   
 }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-app';
}
