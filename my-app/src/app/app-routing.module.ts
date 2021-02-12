import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full'},
  { path: 'RequireTAPositionsComponent', component: RequireTAPositionsComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
