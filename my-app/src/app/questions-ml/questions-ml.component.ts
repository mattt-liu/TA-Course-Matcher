import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../questions.service'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InstructorComponentComponent } from '../instructor-component/instructor-component.component';

@Component({
  selector: 'app-questions-ml',
  templateUrl: './questions-ml.component.html',
  styleUrls: ['./questions-ml.component.css']
})
export class QuestionsMlComponent implements OnInit {

  constructor(private questions: QuestionsService) { }

  ngOnInit(): void {
  }

  sendQuestions() {

    // get input values
    let course = (document.getElementById(`course-name`) as HTMLInputElement).value;

    let questions = [];
    for (let i = 0; i < 5; i++) {
      let q = (document.getElementById(`question-${i + 1}`) as HTMLInputElement).value;
      if (q === "") continue; // skip if input is empty
      questions.push(q);
    }

    // exit if questions are empty
    if (questions.length == 0 || course === "") return;

    let data = {
      course: course,
      questions: questions
    }

    this.questions.createQuestions(data).subscribe(data => {
    });

    setTimeout(this.clear, 500);
  }

  clear() {
    (document.getElementById(`course-name`) as HTMLInputElement).value = "";

    for (let i = 0; i < 5; i++) {
      (document.getElementById(`question-${i + 1}`) as HTMLInputElement).value = "";
    }
  }

}
