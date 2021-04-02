import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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
  chooseAlternativeApplicant = false;
  bestApplicant; // the best applicant for the currently selected course (name as string)
  alternativeApplicant = false;
  selectedApplicant; // either set to the default bestApplicant or to the applicant chosen from the dropdown if alternativeApplicant is true
  applicantSelected = false; // becomes true once the user clikcs the "choose this applicant" or "enter alternative applicant" button
  selectedCourseHours; // the number of TA hours required to be assigned to the selected course

  // rankings arrays
    instructorRankings = [];  
    taRankings = [];    // format = [ {ta: "name", rankedThisCourse: 1}, ... ]

  courseSelected(course){
    let courseCode = course.course
    this.selectedCourse = courseCode;
    this.selectedCourseHours = course.hours;
    console.log("hours for course: " + this.selectedCourseHours);
    console.log(courseCode + " selected");
    this.showInstructorTable = true;

    // getting the list of rankings
    this.CoursesService.getInstructorRankings(courseCode).subscribe((data) => {
      this.instructorRankings = data as any;
      console.log(this.instructorRankings);

      // after loading instructor rankings, calculate best applicant
      this.getBestApplicant();

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
    let selectedTA = this.bestApplicant;

    if(this.alternativeApplicant == true){
      selectedTA = (document.getElementById("taSelection") as HTMLInputElement).value; 
    }

    // todo verify input is an int 
    if(hours == undefined || +hours < 1){
      alert("please enter an integer number of hours to assign to the selected TA, greater than zero");
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
    this.applicantSelected = false;
  }

  // calculate the best applicant for the TA position
  getBestApplicant(){

    let weightData = {};

    // { taNAme: 5, taName: 3}

    // inserting all the TA names into the weight array and giving them an initial weight based on their rank in the instructor array.
    // also giving them a ranking based on their status
    // status 1 gets weight = 4, status 2 gets weight = 2, status 3 gets weight = 0

      for(let i = 0; i < this.instructorRankings.length; i++){
        weightData[this.instructorRankings[i].name] = this.instructorRankings.length - i;

        if(this.instructorRankings[i].status != 1 && this.instructorRankings[i].status != 2 && this.instructorRankings[i].status != 3 ){
          console.log("Error, applicant does not have status property of value 1, 2 or 3");
        }

        // giving weight based on status
        if(this.instructorRankings[i].status == 1){
          weightData[this.instructorRankings[i].name] += 4;
        }

        else if(this.instructorRankings[i].status == 2){
          weightData[this.instructorRankings[i].name] += 2;
        }
        // give no additional weight is status == 3
      }
    
    console.log(weightData);

    // adjusting the weights based on the TA rankings now
    
      for(let i = 0; i < this.taRankings.length; i++){
        for(let j of Object.keys(weightData)){
          if(this.taRankings[i].name == j){

            // adding weight to the TA based on where the ta is in the TA rankings array order
            weightData[j] += this.taRankings.length - i;
          }
        }
      }
    
    console.log(weightData);

    // todo now adjusting weight based on TA and course Hours
    // let sleectedCourseHours = ?  <-- need to get this from thew formula
    // let 

    // here is also where we split the TA hours among multiple TAs ?

    let highestweight = 0;
    let highestApplicant;

    // selecting the best applicant based on weight now and setting it to bestApplicant property
      
      for(let i of Object.keys(weightData)){
        if(weightData[i] > highestweight){
          highestweight = weightData[i];
          highestApplicant = i;
        }
      }

      console.log("highest ranked applicant: " + highestApplicant);
      this.bestApplicant = highestApplicant;
  }

  // asssign the suggested applicant to the TA for this class
  assignSuggestedApplicant(){
    this.applicantSelected = true;
    this.alternativeApplicant = false;
    let hours = (document.getElementById("taAssignmentHours") as HTMLInputElement).value; 
    let selectedTA = this.bestApplicant;

    // todo verify input is an int 
    if(hours == undefined){
      alert("please enter an integer number of hours to assign to the selected TA");
    }

    let assignmentData = {
      name: selectedTA,
      hours: +hours,
    };

    // assign the number of hours to the chosen TA
    this.CoursesService.assignInstructoryRankings(this.selectedCourse, assignmentData).subscribe( (response) => {
      console.log(response);
      if(response === "Applicant already assigned!"){
        alert(response);
      }
    });

  }

}
