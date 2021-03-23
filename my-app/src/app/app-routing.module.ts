import { NgModule } from '@angular/core';
import { CourseInfoAndQuestionsComponent } from './course-info-and-questions/course-info-and-questions.component'
import { RouterModule, Routes } from '@angular/router';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';
import { HoursComponent } from './hours/hours.component';
import { ApplicantInformationComponent } from './applicant-information/applicant-information.component';

const routes: Routes = [
  { path: 'questions', component: QuestionsMlComponent },
  { path: 'RequireTAPositionsComponent', component: RequireTAPositionsComponent},
  { path: 'hours', component: HoursComponent},
  { path: 'Info', component: CourseInfoAndQuestionsComponent},
  { path: 'applicants', component: ApplicantInformationComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
