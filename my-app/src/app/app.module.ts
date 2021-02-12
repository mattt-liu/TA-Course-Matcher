import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ConfigService } from './require-tapositions/require-tapositions.component';
import { RequireTAPositionsComponent } from './require-tapositions/require-tapositions.component';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { QuestionsMlComponent } from './questions-ml/questions-ml.component';
import { AppRoutingModule } from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    RequireTAPositionsComponent
    QuestionsMlComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
