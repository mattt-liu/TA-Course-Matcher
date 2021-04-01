import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxCsvParserModule } from 'ngx-csv-parser';

import { ConfigService } from './require-tapositions/require-tapositions.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';
import { AppRoutingModule } from './app-routing.module';
import { HoursComponent } from './hours/hours.component';
import { InstructorComponentComponent } from './instructor-component/instructor-component.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CourseInfoAndQuestionsComponent } from './course-info-and-questions/course-info-and-questions.component';
import { ApplicantInformationComponent } from './applicant-information/applicant-information.component';
import { TAApplyAndRankComponent } from './ta-apply-and-rank/ta-apply-and-rank.component';
import { DepartmentTASelectionComponent } from './department-ta-selection/department-ta-selection.component';
import { UploadApplicantComponent } from './upload-applicant/upload-applicant.component';
import { UploadRankingsComponent } from './upload-rankings/upload-rankings.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignupComponent } from './signup/signup.component';
import { UserAdminComponent } from './user-admin/user-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    RequireTAPositionsComponent,
    QuestionsMlComponent,
    HoursComponent,
    InstructorComponentComponent,
    ApplicantInformationComponent,
    TAApplyAndRankComponent,
    DepartmentTASelectionComponent,
    CourseInfoAndQuestionsComponent,
    UploadApplicantComponent,
    UploadRankingsComponent,
    LogInComponent,
    SignupComponent,
    UserAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxCsvParserModule
  ],
  providers: [
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
