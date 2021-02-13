import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ConfigService } from './require-tapositions/require-tapositions.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';

import { AppComponent } from './app.component';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';
import { AppRoutingModule } from './app-routing.module';
import { HoursComponent } from './hours/hours.component';
import { InstructorComponentComponent } from './instructor-component/instructor-component.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    RequireTAPositionsComponent,
    QuestionsMlComponent,
    HoursComponent,
    InstructorComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatTableModule,
    BrowserAnimationsModule
  ],
  providers: [
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
