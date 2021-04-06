import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../courses.service';
import { QuestionsService } from '../questions.service';
import { ConfigService } from '../require-tapositions/require-tapositions.component';

@Component({
  selector: 'app-ta-apply-and-rank',
  templateUrl: './ta-apply-and-rank.component.html',
  styleUrls: ['./ta-apply-and-rank.component.css']
})
export class TAApplyAndRankComponent implements OnInit {

  constructor(
    private CoursesService: CoursesService,
    private qService: QuestionsService,
    private _configservice: ConfigService
    ) { }

  ngOnInit(): void {
    this.getCourses();
    this._configservice.getapplicants().subscribe((data) => this.applicants = data);
  }

  courseData; // course data to be rendered into the table
  applicants;
  error: boolean = false;
  app1;
  app2;
  app3;

  /* dummy data
    notAppliedCourseList = { 
      se3313: { questions: ["question 1", "question2", "question3"],
                hours: 24,
              },
      se3350: { questions: ["question 1", "question2", "question3"],
                hours: 10,
              }
    };

    // order determines 'rank'
    appliedCourseList = {
      se2202: { questions: ["question 1", "question2", "question3"],
                hours: 5,
              },
      se3309: { questions: ["question 1", "question2", "question3"],
                hours: 15,
            },
      ece3375: { questions: ["question 1", "question2", "question3"],
                 hours: 20,
      }
    }; 
  */

  courseRowSelected(course){
    this.courseData.course.expanded = true;
  }
 
  getCourses(){
    // fetch list of courses
    this.CoursesService.getCourseData().subscribe( (data) => {
      this.courseData = data;

      for(let i of this.courseData){
        i.expanded = false;
      };
    });
  }

  getCourseQuestions(){

  }

  selectCourse(){
    // expand course info / trigger popup
    // allow TA user to fill out application (data already retrieved)
  }

  updateApps() {
    let app1 = (document.getElementById("dropdown1") as HTMLInputElement).value; 
    let app2 = (document.getElementById("dropdown2") as HTMLInputElement).value; 
    let app3 = (document.getElementById("dropdown3") as HTMLInputElement).value; 
    if (app1 !== "") this.CoursesService.getApplicantRankings(app1).subscribe(data => this.app1 = data);
    if (app2 !== "") this.CoursesService.getApplicantRankings(app2).subscribe(data => this.app2 = data);
    if (app3 !== "") this.CoursesService.getApplicantRankings(app3).subscribe(data => this.app3 = data);
  }

  submitRankings(){
    this.error = false;

    let course = (document.getElementById("dropdown-course") as HTMLInputElement).value; 
    let app1 = (document.getElementById("dropdown1") as HTMLInputElement).value; 
    let app2 = (document.getElementById("dropdown2") as HTMLInputElement).value; 
    let app3 = (document.getElementById("dropdown3") as HTMLInputElement).value; 

    if (app1 === "" || app2 === "" || app3 === "") return;
    if (course === "") return;
    if (app1 === app2 || app2 === app3 || app1 === app3) this.error = true;
    let obj = {
      course: course,
      rankings: [app1, app2, app3]
    }
    this.CoursesService.addCourseRankings(obj).subscribe();
  }

}
