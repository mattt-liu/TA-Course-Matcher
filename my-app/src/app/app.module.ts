import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ConfigService } from './require-tapositions/require-tapositions.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';
import { AppRoutingModule } from './app-routing.module';
import { HoursComponent } from './hours/hours.component';
import { InstructorComponentComponent } from './instructor-component/instructor-component.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TAApplyAndRankComponent } from './ta-apply-and-rank/ta-apply-and-rank.component';
import { DepartmentTASelectionComponent } from './department-ta-selection/department-ta-selection.component';
import { CourseInfoAndQuestionsComponent } from './course-info-and-questions/course-info-and-questions.component';

@NgModule({
  declarations: [
    AppComponent,
    RequireTAPositionsComponent,
    QuestionsMlComponent,
    HoursComponent,
    InstructorComponentComponent,
    TAApplyAndRankComponent,
    DepartmentTASelectionComponent,
    CourseInfoAndQuestionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
