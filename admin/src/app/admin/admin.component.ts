import { Component, OnInit } from '@angular/core';
import { Activity } from './activity';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  public manualApprovalActivities: Activity[];
  public selectedManualApprovalActivityId: string;

  constructor(
    private adminService: AdminService,
  ) { }

  private getActivitiesRequiringManualApproval(): void {
    this.adminService.getActivitiesRequiringManualApproval()
      .subscribe(manualApprovalActivities => this.manualApprovalActivities = manualApprovalActivities as Activity[],error => {
        console.log('error', error)
      });
  }

  public onManualApprovalActivityClick(manualApprovalActivityId) {
    this.selectedManualApprovalActivityId = manualApprovalActivityId;
  }

  ngOnInit() {
    this.getActivitiesRequiringManualApproval();
  }
}
