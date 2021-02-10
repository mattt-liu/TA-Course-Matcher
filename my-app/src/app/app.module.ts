import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';

@NgModule({
  declarations: [
    AppComponent,
    QuestionsMlComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
