import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../courses.service';
import { QuestionsService } from '../questions.service';

@Component({
  selector: 'app-ta-apply-and-rank',
  templateUrl: './ta-apply-and-rank.component.html',
  styleUrls: ['./ta-apply-and-rank.component.css']
})
export class TAApplyAndRankComponent implements OnInit {

  constructor(private CoursesService: CoursesService, private qService: QuestionsService) { }

  ngOnInit(): void {
    this.getCourses();
  }

  courseData; // course data to be rendered into the table
  

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

      console.log(data);
    });
  }

  getCourseQuestions(){

  }

  selectCourse(){
    // expand course info / trigger popup
    // allow TA user to fill out application (data already retrieved)
  }

  submitRankings(){
    // push ranking order to db
  }

}
