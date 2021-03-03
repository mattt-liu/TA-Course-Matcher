import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { courses } from './needsTAs';
import { questions } from '../course-info-and-questions/questions';


@Injectable()
export class ConfigService {

private linkstring: string = "http://localhost:3000/api/getcourses";
private linkstring1: string = "http://localhost:3000/api/getquestions";


constructor(private http: HttpClient) { }
   
  
getcourses(): Observable<courses[]> {
return this.http.get<courses[]>(this.linkstring);
    }

getquestions(): Observable<questions[]> {
return this.http.get<questions[]>(this.linkstring1);
    }
   
}

@Component({
  selector: 'app-require-tapositions',
  templateUrl: './require-tapositions.component.html',
  styleUrls: ['./require-tapositions.component.css']
})

export class RequireTAPositionsComponent implements OnInit {
  
  courses = [];
  needsPositions = [];


  constructor(private _configservice:ConfigService) {}

  

  ngOnInit(): void {
    this._configservice.getcourses().subscribe((data) => this.courses = data);

  }

  // minimize() {
  //   this.needsPositions = [];
  // }


  loopthroughobject() {

    for (var key in this.courses) {
      this.needsPositions.push(this.courses[key].course)
    
    }
  }



}
  

