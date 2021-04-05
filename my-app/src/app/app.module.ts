import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxCsvParserModule } from 'ngx-csv-parser';

import { ConfigService } from './require-tapositions/require-tapositions.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
import { AdjustTahoursComponent } from './adjust-tahours/adjust-tahours.component';
import { TAservice } from './adjust-tahours/adjust-tahours.component';
import { UserAdminComponent } from './user-admin/user-admin.component';
import { UploadEnrollmentComponent } from './upload-enrollment/upload-enrollment.component';
import { UploadCourseSetupComponent } from './upload-course-setup/upload-course-setup.component';
import { UploadUserComponent } from './upload-user/upload-user.component';
import { ExportCourseComponent } from './export-course/export-course.component'

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
    AdjustTahoursComponent,
    UserAdminComponent,
    UploadEnrollmentComponent,
    UploadCourseSetupComponent,
    UploadUserComponent,
    ExportCourseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxCsvParserModule,
    FormsModule
  ],
  providers: [
    ConfigService,
    TAservice,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
