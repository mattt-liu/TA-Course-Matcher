import { Component, OnInit } from '@angular/core';
import { HoursService } from '../hours.service';

@Component({
  selector: 'app-hours',
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.css']
})
export class HoursComponent implements OnInit {

  constructor(private hoursService: HoursService) { }

  ngOnInit(): void {
  }

  sendHours() {

    // get input values
    let course = (document.getElementById(`course-name`) as HTMLInputElement).value;

    let prevEnrol = (document.getElementById(`prevEnrol`) as HTMLInputElement).value;
    let prevHours = (document.getElementById(`prevHours`) as HTMLInputElement).value;
    let enrol = (document.getElementById(`enrol`) as HTMLInputElement).value;

    // exit if empty
    if (course === "") return;

    let data = {
			course: course,
			prevHours: prevHours,
			prevEnrol: prevEnrol,
			enrol: enrol
    }

    this.hoursService.allocateHours(data).subscribe(data => {
    });

    setTimeout(this.clear, 500);
  }

  clear() {
    (document.getElementById(`course-name`) as HTMLInputElement).value = "";
    (document.getElementById(`prevEnrol`) as HTMLInputElement).value = "";
    (document.getElementById(`prevHours`) as HTMLInputElement).value = "";
    (document.getElementById(`enrol`) as HTMLInputElement).value = "";
  }
}
