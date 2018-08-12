import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { TriviaComponent } from './admin/trivia/trivia.component';
import { ManualApprovalComponent } from './admin/manual-approval/manual-approval.component';
import { SafeHtmlPipe } from './admin/safe-html.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TriviaComponent,
    ManualApprovalComponent,
    SafeHtmlPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
