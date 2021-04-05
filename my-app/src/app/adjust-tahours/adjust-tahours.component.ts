import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TA } from './TAhours';
import { environment } from '../../environments/environment';


@Injectable()
export class TAservice {


private getTAstring: string = `${environment.apiUrl}/api/getTAhours`;
private postTAstring: string = `${environment.apiUrl}/api/replaceTAhours`;

constructor(private http: HttpClient) { }

postTA(pdn) {
return this.http.post(this.postTAstring, pdn).toPromise().then(data => {
  console.log(data);
});
    }

getTA(): Observable<TA[]> {
return this.http.get<TA[]>(this.getTAstring);
    }


}


@Component({
  selector: 'app-adjust-tahours',
  templateUrl: './adjust-tahours.component.html',
  styleUrls: ['./adjust-tahours.component.css']
})
export class AdjustTahoursComponent implements OnInit {

  TA = [];
  display = [];


  constructor(private _TAservice:TAservice) { }

  ngOnInit(): void {
    this._TAservice.getTA().subscribe((data) => {
      this.TA = data;
      this.displayTA();
    });
  }

  displayTA(){ 
    this.display = []
    for (var key in this.TA) {
      this.display.push(this.TA[key])
    }
  }
  searchTA(){ 
    let TAname = (document.getElementById("TAname") as HTMLInputElement).value; 
    let TAcourse = (document.getElementById("TAcourse") as HTMLInputElement).value; 
    let newTAhours = (document.getElementById("newTAhours") as HTMLInputElement).value;
    let found = false; 

   
   

    //handle eventS where a box was not filled
    if (!TAname) {
      alert("Please in put the name of the TA")
     }

    else if(!TAcourse) {
      alert("Please in put the course of the TA")
     }

    else if(!newTAhours) {  
      alert("Please a number for the new TA hours")
     }

     //if everything is filled out 
     else  {
      for (var key in this.TA) {
       
    
        if (TAname.toLowerCase() == this.TA[key].name.toLowerCase() && TAcourse.toLowerCase() == this.TA[key].course.toLowerCase()) {
          //TA with that name and course was found

          //now do post request that replaces the tas hours
           this.TA[key].hours = newTAhours;
           found = true;

           let postData = {
            name : this.TA[key].name,
            hours : this.TA[key].hours,
            course : this.TA[key].course,
           } 
           this._TAservice.postTA(postData);  }

     }
     //handle situation where the course or the TA is not found
     if(found == false) {
      alert("Sorry a TA with that course was not found")
     }

    }

  }



}
