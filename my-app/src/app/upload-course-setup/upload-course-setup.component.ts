import { Component, OnInit } from '@angular/core';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { CoursesService } from '../courses.service';

@Component({
  selector: 'app-upload-course-setup',
  templateUrl: './upload-course-setup.component.html',
  styleUrls: ['./upload-course-setup.component.css']
})
export class UploadCourseSetupComponent implements OnInit {

  data: any[];
  csvError: boolean = false;

  constructor(
    private csvParser: NgxCsvParser,
    private courseService: CoursesService
  ) { }

  ngOnInit(): void {
  }

  fileListener($event: any): void {

    this.csvError = false;

    const files = $event.srcElement.files;
    this.csvParser.parse(files[0], { header: false, delimiter: ',' }).pipe()
      .subscribe((data: Array<any>) => {
        this.data = data;
      }, (err: NgxCSVParserError) => {
        console.log(err);
        this.csvError = true;
      })
  }

  saveData() {

    // parse each row of data
    let formatted = []
    for (let row of this.data.slice(1)) {
      if (row[0] === "") continue;

      try {
        let obj = {
          course: row[0],
          name: row[1],
          lectureHours: parseInt(row[2]),
          labHours: parseInt(row[3]),
          sections: parseInt(row[4])
        }
        if (!row[3]) obj.labHours = 0;
        formatted.push(obj);
      } catch (err) {
        continue;
      }
    }

    // send to API sequentially
    for (let i = 0; i < formatted.length; i++) {
      let obj = formatted[i];
      setTimeout(() => this.courseService.addCourse(obj).subscribe(), i * 100);
    }

    // clear form after user submits
    this.data = undefined;
    (document.getElementById("csvFileUpload3") as HTMLInputElement).value = "";


  }


}
