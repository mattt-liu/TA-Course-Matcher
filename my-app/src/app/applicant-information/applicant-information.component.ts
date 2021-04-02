
import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../require-tapositions/require-tapositions.component';

@Component({
  selector: 'app-applicant-information',
  templateUrl: './applicant-information.component.html',
  styleUrls: ['./applicant-information.component.css']
})
export class ApplicantInformationComponent implements OnInit {

  applicants = [];
  filteredapplicants = [];
  questions = [];
  expand: boolean[] = undefined;
  answers = [];

  constructor(private _configservice: ConfigService) { }

  ngOnInit(): void {
    this.fillExpand();
    this._configservice.getapplicants().subscribe((data) => {
      this.applicants = data;
    });
    this._configservice.getquestions().subscribe((data) => {
      this.questions = data;
      this.getAnswers();
      console.log(this.answers);
    });
  }

  getAnswers() {
    this.answers = [];

    for (let applicant of this.applicants) {
        let app = {
          questions: [],
          answers: applicant.answers
        }
        for (let i = 0; i < applicant.appliedCourses.length; i ++) {
          for (let q of this.questions) {
            if (q.course === applicant.appliedCourses[i].toUpperCase()) {
              app.questions.push(q.questions);
            }
          }
        }
      this.answers.push(app);
    }
  }

  display() {
    this.filteredapplicants = this.applicants.slice();

    for (var i in this.filteredapplicants) {
      for (var j in this.filteredapplicants[i].appliedCourses) {

        for (var k in this.questions) {

          if (this.filteredapplicants[i].appliedCourses[j].toUpperCase() == this.questions[k].course) {

            // console.log(this.filteredapplicants[i].appliedCourses[j]+"-"+this.questions[k].course) 

            //simply print the questions for that course
            for (var l in this.questions[k].questions) {
              //  console.log(this.questions[k].questions[l])
              this.filteredapplicants[i].appliedCourses[j] = (this.filteredapplicants[i].appliedCourses[j] + "-" + this.questions[k].questions[l])

            }
          }
        }
      }
    }
  }

  bruh() {console.log("a", this.applicants, "fa", this.filteredapplicants, "q", this.questions)}

  fillExpand() {
      this.expand = [];
      for (let i = 0; i < this.applicants.length; i++) {
          this.expand.push(false);
      }
  }
}


