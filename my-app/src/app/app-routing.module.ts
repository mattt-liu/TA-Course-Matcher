import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';

const routes: Routes = [
  { path: 'questions', component: QuestionsMlComponent },
  { path: 'RequireTAPositionsComponent', component: RequireTAPositionsComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
