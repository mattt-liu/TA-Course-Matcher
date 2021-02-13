import { Component, OnInit } from '@angular/core';
import { qualificationsService } from './qualifications.service';

// angular material table stuff (test)
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-instructor-component',
  templateUrl: './instructor-component.component.html',
  styleUrls: ['./instructor-component.component.css']
})
export class InstructorComponentComponent implements OnInit {

  constructor(private qualificationsService: qualificationsService) { }

  //table stuff
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  ngOnInit(): void {
  }

  createQualificationsEnabled = false;
  selectedCourse;

  buttonPressed(){
    this.createQualificationsEnabled = true;
  }

  courseQualificationsSubmitted(){
    let input = (document.getElementById("courseQualificationsTextarea") as HTMLInputElement).value;
    this.selectedCourse = (document.getElementById("courseNameInput") as HTMLInputElement).value;
    
    let data = {
      course: this.selectedCourse,
      qualifications: input
    }

    if(this.selectedCourse == undefined || this.selectedCourse == null || this.selectedCourse == ""){
      data.course = "se123";
    }
    
    // send the qualifications to the db through the service
    this.qualificationsService.submitQualifications(data).subscribe(data => {
    });
    alert("the following was submitted: \n" + input);
  }
}

/* applciation from instructor view 
[this is a button]

list of courses they instruct
  course a [select course]
  course b [select course]
  ...

[select course] -> show course details i.e. qualifications and questions already defined (allow them to be edited?)
                -> [setup TA application details]
                -> [see applied applicants]?


[setup TA application details] -> [add question]
                               -> (select: answer type: multiple choice, string)
                               -> [add multiple choice option]
                               -> add qualifications description

*/