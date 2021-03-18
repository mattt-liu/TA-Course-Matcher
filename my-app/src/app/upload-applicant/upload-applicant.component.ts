import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { UploadApplicantService } from '../upload-applicant.service';

@Component({
	selector: 'app-upload-applicant',
	templateUrl: './upload-applicant.component.html',
	styleUrls: ['./upload-applicant.component.css']
})
export class UploadApplicantComponent implements OnInit {

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

	saveData() {
		let formatted = []

		for (let row of this.data.slice(1)) {
			if (row[0] === "") continue;
			let obj = {
				course: row[0],
				name: row[1],
				email: row[2],
				status: parseInt(row[3]),
				hours: parseInt(row[4]),
				ranking: parseInt(row[5]),
				answers: []
			}
			// answers is odd indexes after 6
			for (let i = 7; i < row.length; i += 2) {
				if (row[i] === "") continue;
				obj.answers.push(row[i]);
			}
			formatted.push(obj);
		}

		this.uploadService.addApplicant(formatted).subscribe(res => {
			// clear form after submit
			this.data = undefined;
			(document.getElementById("csvFileUpload") as HTMLInputElement).value = "";
		}, err => {
			// handle error
			console.log(err);
		});
	}
}
