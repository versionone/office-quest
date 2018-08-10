import { Component, OnInit } from '@angular/core';
import { Activity } from './activity';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  public manualApprovalActivities: Activity[] = [];

  constructor(
    private adminService: AdminService,
  ) { }

  private getActivitiesRequiringManualApproval(): void {
    this.adminService.getActivitiesRequiringManualApproval()
      .subscribe(manualApprovalActivities => this.manualApprovalActivities = manualApprovalActivities as Activity[],error => {
        console.log('error', error)
      });
  }

  public onApproveClick(manualApprovalActivity) {
    const postBody = {
      participantActivityId: manualApprovalActivity._id,
      participantId: manualApprovalActivity.participant_id,
    };

    this.adminService.approveActivity(postBody)
      .subscribe(() => {
        this.getActivitiesRequiringManualApproval();
      }, error => {
        console.log('error', error);
      });
  }

  ngOnInit() {
    this.getActivitiesRequiringManualApproval();
  }
}
