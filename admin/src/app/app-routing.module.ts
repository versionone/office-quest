import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TriviaComponent } from './admin/trivia/trivia.component';
import { ManualApprovalComponent } from './admin/manual-approval/manual-approval.component';

const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'manualApproval', component: ManualApprovalComponent },
  { path: 'trivia', component: TriviaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
