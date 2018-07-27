import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { JoinComponent } from './quests/join/join.component';
import { MainComponent } from './activities/main/main.component';
import { SafeHtmlPipe } from './activities/safe-html.pipe';

@NgModule({
  declarations: [
    AppComponent,
    JoinComponent,
    MainComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
