import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../require-tapositions/require-tapositions.component';
import { courses } from '../require-tapositions/needsTAs';
import { QuestionsService } from '../questions.service';


@Component({
  selector: 'app-course-info-and-questions',
  templateUrl: './course-info-and-questions.component.html',
  styleUrls: ['./course-info-and-questions.component.css']
})
export class CourseInfoAndQuestionsComponent implements OnInit {
  courses = [];
  infoArray = [];
  selectedCourse = undefined;

  constructor(
    private _configservice:ConfigService,
    private qService: QuestionsService
    ) { 
    
  }

  ngOnInit(): void {
    this._configservice.getquestions().subscribe((data) => this.courses = data);

  }

  showInformation(){


    this.infoArray =[];
    let dropdownChoice = (document.getElementById("dropdown") as HTMLInputElement).value; 

    for (var key in this.courses) {
      if (this.courses[key].course == dropdownChoice)  {
        this.selectedCourse = this.courses[key];
        this.infoArray.push(this.courses[key])
      }
    
    }



  }

  submitQuestion() {
    let questioninput = (document.getElementById("question-input") as HTMLInputElement).value; 

    let questions = [questioninput];
    let obj = {
      course: this.selectedCourse.course,
      questions: questions
    }
    console.log(obj)
    this.qService.createQuestions(obj).subscribe(() => {
      (document.getElementById("question-input") as HTMLInputElement).value = ""; 
      setTimeout(() => window.location.reload(), 100);
    });
  }

}
