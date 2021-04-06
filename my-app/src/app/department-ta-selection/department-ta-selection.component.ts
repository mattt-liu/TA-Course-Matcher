import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { string } from 'joi';
import { isUndefined } from 'util';
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
  assignedHours;
  assignedTAs = [];
  assignmentComplete = false;


  // rankings arrays
    instructorRankings = [];  
    //initialInstructorRankings = []; // the same as instructorRankings but we modify the instructor rankings in the getBestApplicsnt() method but we don't want to show those changes in the HTML tables (todo make one local)
    taRankings = [];    // format = [ {ta: "name", rankedThisCourse: 1}, ... ]

  courseSelected(course){

    // resetting TA variables and data
      this.assignmentComplete = false;
      this.assignedHours = {};
      this.assignedTAs = [];
      
    let courseCode = course.course
    this.selectedCourse = courseCode;
    this.selectedCourseHours = course.hours;
    // console.log(courseCode + " selected");
    this.showInstructorTable = true;

    // getting the list of rankings
    this.CoursesService.getInstructorRankings(courseCode).subscribe((data) => {
      this.instructorRankings = (data as Array<any>).slice();
      //this.initialInstructorRankings = (data as Array<any>).slice();
      //console.log(this.initialInstructorRankings);
      // console.log(this.instructorRankings);

      // after loading instructor rankings, calculate best applicant
      this.getBestApplicant();
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
      // console.log(this.taRankings);
      this.showTaRankingTable = true;
    });
    //edit hours and push to db
  }

  getCourseList(){
    this.CoursesService.getCourseData().subscribe((data) => {
      this.courseData = data as any;
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
    

    // console.log(this.selectedCourse);
    // console.log(assignmentData);
    
    this.CoursesService.assignInstructoryRankings(this.selectedCourse, assignmentData).subscribe( (response) => {
      // console.log(response);
      if(response === "Applicant already assigned!"){
        alert(response);
      }
    });
    this.applicantSelected = false;
  }

  // calculate the best applicant for the TA position
  getBestApplicant(){

    let weightData = {};
    
    let instructorRankings = [];
    this.instructorRankings.forEach(val => instructorRankings.push(Object.assign({}, val)));

    // { taNAme: 5, taName: 3}

    // inserting all the TA names into the weight array and giving them an initial weight based on their rank in the instructor array.
    // also giving them a ranking based on their status
    // status 1 gets weight = 4, status 2 gets weight = 2, status 3 gets weight = 0

      for(let i = 0; i < instructorRankings.length; i++){
        weightData[instructorRankings[i].name] = instructorRankings.length - i;

        if(instructorRankings[i].status != 1 && instructorRankings[i].status != 2 && instructorRankings[i].status != 3 ){
          // console.log("Error, applicant does not have status property of value 1, 2 or 3");
        }

        // giving weight based on status
        if(instructorRankings[i].status == 1){
          weightData[instructorRankings[i].name] += 4;
        }

        else if(instructorRankings[i].status == 2){
          weightData[instructorRankings[i].name] += 2;
        }
        // give no additional weight is status == 3
      }
    
    // console.log(weightData);

    // adjusting the weights based on the TA rankings now
    
      for(let i = 0; i < this.taRankings.length; i++){
        for(let j of Object.keys(weightData)){
          if(this.taRankings[i].name == j){

            // adding weight to the TA based on where the ta is in the TA rankings array order
            weightData[j] += this.taRankings.length - i;
          }
        }
      }
    
    // console.log(weightData);

    // todo now adjusting weight based on TA and course Hours
    // let sleectedCourseHours = ?  <-- need to get this from thew formula
    //let selectedCourseHours = 15; 
    let selectedCourseHours = this.selectedCourseHours;
    // console.log("Selected course hours: " + selectedCourseHours);

    // here is also where we split the TA hours among multiple TAs ?

    let highestWeight = 0;
    //let chosenApplicants = []; remoed; same as assignedHours
    let bestApplicant;
    let remainingCourseHours = selectedCourseHours;
    let assignedHours = {};

    
    // selecting the best applicant based on weight now and setting it to bestApplicant property
      
      outerLoop: for(let x = 0; ; x++) { // this loop is used to repeat the assignment process as many times until enough TAs have been assigned to cover the courses requred hours.
        
        if(remainingCourseHours >= 10){  // just in case some course doesn't have less than 10 hours to start (alglorithm would break)

          if(!this.checkTAs(assignedHours)){ // check if there are even any remaining TAs
            console.log("error, no remaining TAs");
            break outerLoop;
          }

          for(let i of instructorRankings){  // adding 4 weight if the TA has the exact number of hours to fulfill the course
            if(i.hoursLeft == remainingCourseHours){
              console.log(i.name + " weight increased by 4; exact number of hours");
              weightData[i.name] += 4;
            }
          }
            
          // finding the next best applicant that has not already been assigned hours

          quickBreak: for(let i of Object.keys(weightData)){  

              // skip applicants that have no hours left TODO apply this in other places

                for(let x of instructorRankings){
                  if(x.hoursLeft == 0 && x.name == i){
                    continue quickBreak;
                  }
                }

              if(weightData[i] > highestWeight && (!Object.keys(assignedHours).includes(i))){  // also check if the "highest weighted applicant" has already been assigned hours (since we looping through)
                highestWeight = weightData[i];
                bestApplicant = i;
              }
              else if(weightData[i] == highestWeight){
                // console.log("equal weights; brokem");
              }
            }

          // now assign that applicant their desired hours

                // loop through instructor rankings, get the hours the TA applied for (for this course specifically) and assign them to the TA
                  
                  for(let applicant of instructorRankings){
                    if(applicant.name == bestApplicant){
                      assignedHours[bestApplicant] = applicant.hoursLeft; // todo fix backend to get hours specific to course; this doesnt work rn
                      remainingCourseHours -= applicant.hoursLeft;
                      // console.log(weightData);
                      // console.log(applicant.hoursLeft + " hours assigned to " + bestApplicant + "\n remaining course hours: " + remainingCourseHours);
                      applicant.hoursLeft = 0;    // this sets it to zero yea? pass by reference? todo verify
                    }
                  }
          }
          bestApplicant = undefined;  // resetting before we get the next best
          highestWeight = 0;
        
          if(remainingCourseHours == 0){
            // console.log("zero course hours left to be assigned; assignment complete");
            break outerLoop;
          }
        
          // now checking if the remaining hours are less than 10 so that we need to assign one more TA partial hours and be done

            if(remainingCourseHours < 5){     // assign the next best TA who signed up for 5 hours or has less than 5 (the exact amount)

              if(!this.checkTAs(assignedHours)){ // check if there are even any remaining TAs
                // console.log("error, no remaining TAs");
                break outerLoop;
              }
              
              for(let i of instructorRankings){

                if(i.hoursLeft !<= 5){
                  continue;
                }        

                if(i.hoursLeft == remainingCourseHours){ // add 4 weight if they have the exact number of hours (or 3?)
                  weightData[i.name] += 4;
                }

                if(weightData[i.name] > highestWeight && (!Object.keys(assignedHours).includes(i))){  // also check if the "highest weighted applicant" has already been assigned hours (since we looping through)
                  highestWeight = weightData[i];
                  bestApplicant = i.name;
                }
              }

              // now assign the TA the remaining course hours (will be one or more less than what they wanted)
                assignedHours[bestApplicant] = remainingCourseHours;
                // console.log(weightData);
                // console.log(remainingCourseHours + " hours assigned to " + bestApplicant + "\n remaining course hours: 0");
                remainingCourseHours = 0;
              
              // no need to reduce the instructor rankings because we are done
              // actually probably best to since we need to push this shit when we submit
                for(let i of instructorRankings){
                  if(i.name == bestApplicant){
                    i.hoursLeft -= remainingCourseHours;
                  }
                }

              // now loop through the weightData and grab the applicant that has the highest weight as calculated above

              // console.log("the course has now been fully assigned");
              break outerLoop; 
            }
            else if(remainingCourseHours <= 10){  // else if between 5 and 10 assign to the next best TA who picked 10 hours

              if(!this.checkTAs(assignedHours)){ // check if there are even any remaining TAs
                // console.log("error, no remaining TAs");
                break outerLoop;
              }

              // edge case for exactly 5 

                if(remainingCourseHours == 5){

                  // check if there is even a TA with exactly 5, put them into array
                  let fittingTAs = [];
                  for(let i of instructorRankings){
                    if(i.hoursLeft == 5){
                      fittingTAs.push(i.name);
                      // console.log(i.name + " added to fitting TAs");
                    }
                  }

                  if(fittingTAs.length != 0){

                    // getting the highest weighted TA in the array of those who have exactly 5 hours
                    for(let i of Object.keys(weightData)){
                      if(weightData[i] > highestWeight && (!Object.keys(assignedHours).includes(i))){
                        highestWeight = weightData[i];
                        bestApplicant = i;
                      }
                    }
                    // and now assigning them
                      assignedHours[bestApplicant] = remainingCourseHours;
                      // console.log(weightData);
                      // console.log(remainingCourseHours + " hours assigned to " + bestApplicant + "\n remaining course hours: 0");
                      remainingCourseHours = 0;
                      
                      // reducing instructor rakings since we are gunna push this to db
                      for(let i of instructorRankings){
                        if(i.name == bestApplicant){
                          i.hoursLeft -= remainingCourseHours;
                        }
                      }
                      break outerLoop;
                  }

                  // todo do something when fitting TAs length is zero?
                  // console.log("fitting TAs array length zero; assigning TA with non-exact hours");
                }
                // else {
                  // else continue on and assign a TA with more than 5 hours

                      for(let i of instructorRankings){

                          // console.log(i);
                          
                          if(i.hoursLeft < remainingCourseHours){ // TODO do check at end if there is still no TA assigned (none with more hours but that could be assigned, assign one with less than the number of hours? or just leave it and don;t assign a TA?)
                            // console.log(i.name + " has less than " + remainingCourseHours + " hours left, skipping");
                            continue;
                          }

                          if(i.hoursLeft == remainingCourseHours){ // add 4 weight if they have the exact number of hours (or 3?)
                            weightData[i.name] += 4;
                            // console.log(i.name + " has the exact number of hours; adding 4 weight");
                          }

                          if(weightData[i.name] > highestWeight && (!Object.keys(assignedHours).includes(i))){  // also check if the "highest weighted applicant" has already been assigned hours (since we looping through)
                            highestWeight = weightData[i];
                            // console.log(i);
                            bestApplicant = i.name;
                          }
                      }

                    // now assign the TA said amount of hours
                      assignedHours[bestApplicant] = remainingCourseHours;
                      // console.log(weightData);
                      // console.log(remainingCourseHours + " hours assigned to " + bestApplicant + "\n remaining course hours: 0");
                      remainingCourseHours = 0;

                    // reducing instructor rakings since we are gunna push this to db
                      for(let i of instructorRankings){
                        if(i.name == bestApplicant){
                          i.hoursLeft -= remainingCourseHours;
                        }
                      }
                //}
              break outerLoop;
            }
          // else reloop and assign another TA, then repeat
      }
      // console.log("the course has now been fully assigned");
      this.assignedHours = assignedHours;
      this.assignmentComplete = false;

      for(let i of Object.keys(this.assignedHours)){
        this.assignedTAs.push(i)
      }

      // console.log(this.assignedHours);
      // console.log("assigned TAs");
  }

  checkTAs(assignedHours){
    let instructorRankings = this.instructorRankings.slice();

    for(let i of instructorRankings){
      if(Object.keys(assignedHours).includes(i.name) || i == undefined || i == null){
        continue;
      }
      return true;
    }
  }

  // asssign the suggested applicant to the TA for this class
  assignSuggestedApplicant(){
    this.applicantSelected = true;
    //this.alternativeApplicant = false;
    let taHours = this.assignedHours;    

    // assign the number of hours to the chosen TA
    for(let applicant of Object.keys(taHours)){

      let assignmentData = {
        name: applicant,
        hours: +taHours[applicant],
      };

      this.CoursesService.assignInstructoryRankings(this.selectedCourse, assignmentData).subscribe( (response) => {
        // console.log(response);
        if(response === "Applicant already assigned!"){
          alert(response);
        }
      });
    }
    this.assignmentComplete = true;

  }
}
