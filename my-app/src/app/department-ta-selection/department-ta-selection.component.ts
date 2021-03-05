import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../courses.service'

@Component({
  selector: 'app-department-ta-selection',
  templateUrl: './department-ta-selection.component.html',
  styleUrls: ['./department-ta-selection.component.css']
})
export class DepartmentTASelectionComponent implements OnInit {

  constructor(private CoursesService: CoursesService) { }

  ngOnInit(): void {
  }
  
  selectedCourse = "";
  selectedCourseInstructor;
  courseData = [];  // arrary (or object?) of course data for each course

  // rankings arrays
    instructorRankings = [];  
    TaRankings = [];    // format = [ {ta: "name", rankedThisCourse: 1}, ... ]

  courseSelected(courseCode){
    this.selectedCourse = courseCode;
    
    // getting the list of rankings
      let instructorRankingList = this.CoursesService.getCourseInstructorRankings(courseCode) as any; // not even worried about what 'as any' does but it fixed the problems
    
    // finding the rankings for the selected course and assigning it to out object

      for(let ranking of instructorRankingList){
        if(ranking.course == this.selectedCourse){
          this.instructorRankings = ranking.rankings;
          this.selectedCourseInstructor = ranking.instructor;
        }
      }
      if(this.instructorRankings.length == 0){
        console.log("Error, rankings were not assigned; selected course did not match any course code in the 'instructor-rankings' db collection");
      }
    
    // todo do the same for TA rankings
      //this.TaRankings = this.this.CoursesService.getCourseTARankings(courseCode) as any; 
      // route not implimented yet^
  }

  taSelected(){
    let selectedTA = (document.getElementById("taSelection") as HTMLInputElement).value; 
    //edit hours and push to db
  }

  getCourseList(){
    this.courseData = this.instructorRankings = this.CoursesService.getCourseData() as any;
  }
}
