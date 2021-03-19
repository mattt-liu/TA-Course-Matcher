import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { UploadApplicantService } from '../upload-applicant.service';

@Component({
  selector: 'app-upload-rankings',
  templateUrl: './upload-rankings.component.html',
  styleUrls: ['./upload-rankings.component.css']
})
export class UploadRankingsComponent implements OnInit {

    data: any[];
    csvError: boolean = false;

    constructor(
        private csvParser: NgxCsvParser,
        private uploadService: UploadApplicantService
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
            }, (err: NgxCSVParserError) => {
                console.log(err);
                this.csvError = true;
            })
    }
}