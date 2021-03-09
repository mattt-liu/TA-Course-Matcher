import { Component, OnInit } from '@angular/core';
import { string } from 'joi';
import { CoursesService } from '../courses.service'

@Component({
  selector: 'app-department-ta-selection',
  templateUrl: './department-ta-selection.component.html',
  styleUrls: ['./department-ta-selection.component.css']
})
export class DepartmentTASelectionComponent implements OnInit {

  constructor(private CoursesService: CoursesService) { }

  ngOnInit(): void {
    this.getCourseList();
  }
  
  selectedCourse = "";
  selectedCourseInstructor;
  courseData = [];  // arrary (or object?) of course data for each course
  showTaRankingTable = false;
  showInstructorTable = false;
  taRowSelected = false;
  selectedTaName;

  // rankings arrays
    instructorRankings = [];  
    taRankings = [];    // format = [ {ta: "name", rankedThisCourse: 1}, ... ]

  courseSelected(courseCode){
    this.selectedCourse = courseCode;
    console.log(courseCode + " selected");
    this.showInstructorTable = true;

    // getting the list of rankings
    this.CoursesService.getInstructorRankings(courseCode).subscribe((data) => {
      this.instructorRankings = data as any;
      console.log(this.instructorRankings);

      // finding the rankings for the selected course and assigning it to out object

      // for(let ranking of instructorRankingList){
      //   if(ranking.course == this.selectedCourse){
      //     this.instructorRankings = ranking.rankings;
      //     this.selectedCourseInstructor = ranking.instructor;
      //   }
      // }
      // if(this.instructorRankings.length == 0){
      //   console.log("Error, rankings were not assigned; selected course did not match any course code in the 'instructor-rankings' db collection");
      // }

    }); 
    
    // todo do the same for TA rankings
      //this.TaRankings = this.this.CoursesService.getCourseTARankings(courseCode) as any; 
      // route not implimented yet^
  }

  taSelected(taName){
    this.taRowSelected = true;
    this.selectedTaName = taName;

    //let selectedTA = (document.getElementById("taSelection") as HTMLInputElement).value; 
    this.CoursesService.getApplicantRankings(taName).subscribe( (data) => {
      this.taRankings = data as any;
      console.log(this.taRankings);
      this.showTaRankingTable = true;
    });
    //edit hours and push to db
  }

  getCourseList(){
    this.CoursesService.getCourseData().subscribe((data) => {
      this.courseData = data as any;
      console.log(this.courseData);
    });
  }

  assignTA(){
    let hours = (document.getElementById("taAssignmentHours") as HTMLInputElement).value; 
    let selectedTA = (document.getElementById("taSelection") as HTMLInputElement).value; 

    // todo verify input is an int 
    if(hours == undefined){
      alert("please enter an integer number of hours to assign to the selected TA");
    }

    let assignmentData = {
      name: selectedTA,
      hours: +hours,
    };

    console.log(this.selectedCourse);
    console.log(assignmentData);
    
    this.CoursesService.assignInstructoryRankings(this.selectedCourse, assignmentData).subscribe( (response) => {
      console.log(response);
      if(response === "Applicant already assigned!"){
        alert(response);
      }
    });
  }
}
