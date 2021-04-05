import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../courses.service';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-export-course',
  templateUrl: './export-course.component.html',
  styleUrls: ['./export-course.component.css']
})
export class ExportCourseComponent implements OnInit {

  courses = undefined;
  sortedData = undefined;
  options = {
    fieldSeparator: ',',
    showLabels: true,
    filename: "course-data",
    useKeysAsHeaders: true
  }
  csvExporter = new ExportToCsv(this.options);

  constructor(
    private courseService: CoursesService
    ) { }

  ngOnInit(): void {
    this.getCourses();
  }

  getCourses() {
    this.courseService.getCourseData().subscribe(data => {
      this.courses = data;

      // sort data 
      this.sortedData = []
      for (let c of this.courses) {
        let newCourse = {
          name: c.name,
          course: c.course,
          questions: c.questions
        }
        this.sortedData.push(newCourse);
      }
    })
  }

  export() {
    this.csvExporter.generateCsv(this.sortedData);
  }
}
