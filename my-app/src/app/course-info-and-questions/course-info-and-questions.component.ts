import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../require-tapositions/require-tapositions.component';
import { courses } from '../require-tapositions/needsTAs';


@Component({
  selector: 'app-course-info-and-questions',
  templateUrl: './course-info-and-questions.component.html',
  styleUrls: ['./course-info-and-questions.component.css']
})
export class CourseInfoAndQuestionsComponent implements OnInit {
  courses = [];
  infoArray = [];

  constructor(private _configservice:ConfigService) { 
    
  }

  ngOnInit(): void {
    this._configservice.getquestions().subscribe((data) => this.courses = data);

  }

  showInformation(){


    this.infoArray =[];
    let dropdownChoice = (document.getElementById("dropdown") as HTMLInputElement).value; 
    console.log(dropdownChoice)

    for (var key in this.courses) {
      if (this.courses[key].course == dropdownChoice)  {
        this.infoArray.push(this.courses[key])
      }
    
    }



  }

}
