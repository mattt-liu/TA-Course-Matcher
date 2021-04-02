
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


  constructor(private _configservice:ConfigService) { }

  ngOnInit(): void {
    this._configservice.getapplicants().subscribe((data) => this.applicants = data);
    this._configservice.getquestions().subscribe((data) => this.questions = data);
    setTimeout(() => this.display(), 250);
  }

  display(){
    this.filteredapplicants = [];

    for (var key in this.applicants) {
      this.filteredapplicants.push(this.applicants[key])
    }

    for (var i in this.filteredapplicants) { 
      for(var j in this.filteredapplicants[i].appliedCourses) { 

       for (var k in this.questions) {

        if (this.filteredapplicants[i].appliedCourses[j].toUpperCase() == this.questions[k].course) {

        console.log(this.filteredapplicants[i].appliedCourses[j]+"-"+this.questions[k].course) 
        
        //simply print the questions for that course
        for (var l in this.questions[k].questions) {
         console.log(this.questions[k].questions[l])
         this.filteredapplicants[i].appliedCourses[j] = (this.filteredapplicants[i].appliedCourses[j]+"-"+this.questions[k].questions[l])

        }


       }
      }

   }
}

  

  

}
}


 