import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ta-apply-and-rank',
  templateUrl: './ta-apply-and-rank.component.html',
  styleUrls: ['./ta-apply-and-rank.component.css']
})
export class TAApplyAndRankComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // dummy data
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

  getCourses(){
    // fetch list of courses
  }

  selectCourse(){
    // expand course info / trigger popup
    // allow TA user to fill out application (data already retrieved)
  }

  submitRankings(){
    // push ranking order to db
  }

}
