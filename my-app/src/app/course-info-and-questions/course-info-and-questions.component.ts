import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../require-tapositions/require-tapositions.component';
import { courses } from '../require-tapositions/needsTAs';
import { QuestionsService } from '../questions.service';
import { CoursesService } from '../courses.service';
import { FormsModule } from '@angular/forms';


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
    private qService: QuestionsService,
    private courseService: CoursesService
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
    // submit the questions

    // also submit "requires"
    setTimeout(() => this.submitCourseRequires(), 250);

    let questioninput = (document.getElementById("question-input") as HTMLInputElement).value;

    if (questioninput === "") return;

    let questions = [questioninput];
    let obj = {
      course: this.selectedCourse.course,
      questions: questions
    }
    if (questioninput === "") return;

    this.qService.createQuestions(obj).subscribe(() => {});
  }

  submitCourseRequires() {
    let course = {
      course: this.selectedCourse.course,
      requires: this.selectedCourse.requires
    }
    this.courseService.requires(course).subscribe(() => {
      this.cancel();
    });
  }

  changeCourse() {
    if (this.selectedCourse.requires) this.selectedCourse.requires = false;
    else this.selectedCourse.requires = true;
  }

  cancel() {
    this.infoArray = [];
    this.selectedCourse = undefined;
    (document.getElementById("dropdown") as HTMLInputElement).value = ""; 
    (document.getElementById("question-input") as HTMLInputElement).value = ""; 
    setTimeout(() => window.location.reload(), 100);
  }
}
