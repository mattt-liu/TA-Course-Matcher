import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { InstructorComponentComponent } from './instructor-component/instructor-component.component';

// angular material table
import {MatTableModule} from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    InstructorComponentComponent
  ],
  imports: [
    BrowserModule,
    MatTableModule,
    HttpClientModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
