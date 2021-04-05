import { Component, OnInit } from '@angular/core';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { UserService } from '../user.service';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-upload-user',
  templateUrl: './upload-user.component.html',
  styleUrls: ['./upload-user.component.css']
})
export class UploadUserComponent implements OnInit {

  inputHeaders;
  data: any[];
  csvError: boolean = false;

  constructor(
    private csvParser: NgxCsvParser,
    private userService: UserService
  ) { }

  @ViewChild('fileImportInput', { static: false }) fileImportInput: any;

  ngOnInit(): void {
  }

  fileListener($event: any): void {

    this.csvError = false;

    const files = $event.srcElement.files;
    this.csvParser.parse(files[0], { header: false, delimiter: ',' }).pipe()
      .subscribe((data: Array<any>) => {
        this.data = data;

        // parse the headers of the file for display
        if (data[0] !== "") this.inputHeaders = data[0];

      }, (err: NgxCSVParserError) => {
        console.log(err);
        this.csvError = true;
      })
  }
  saveData() {
    /* 
    - parse csv file and format data;
    - send formatted data to DB;
    */

    let formatted = []

    // slice from row 1 (row 0 is headers)
    for (let row of this.data.slice(1)) {
      if (row[0] === "") continue;
      let obj = {
        instructor: row[0],
        email: row[1]
      }
      formatted.push(obj);
    }

    // send each row sequentially
    for (let i = 0; i < formatted.length; i++) {
      let obj = formatted[i];
      setTimeout(() => this.userService.addInstructor(obj).subscribe(), i * 100);
    }
    // clear form after user submits
    this.data = undefined;
    (document.getElementById("csvFileUpload4") as HTMLInputElement).value = "";

    // reload
    setTimeout(() => window.location.reload(), 100);
  }
}
