import { Component, OnInit } from '@angular/core';
import { Activity } from '../activity';
import { AdminService } from '../admin.service';
import { Quest } from '../quest';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-manual-approval',
  templateUrl: './manual-approval.component.html',
  styleUrls: ['./manual-approval.component.css']
})
export class ManualApprovalComponent implements OnInit {

  public quests: Quest[];
  public manualApprovalActivities: Activity[] = [];
  public selectedQuestId: string;

  constructor(
    private adminService: AdminService,
    private storageService: StorageService,
  ) { }

  private getQuests(): void {
    this.adminService.getQuests()
      .subscribe(quests => this.quests = quests as Quest[],error => {
        console.log('error', error)
      });
  }

  private getActivitiesRequiringManualApproval(questId: string): void {
    this.adminService.getActivitiesRequiringManualApproval(questId)
      .subscribe(manualApprovalActivities => this.manualApprovalActivities = manualApprovalActivities as Activity[],error => {
        console.log('error', error)
      });
  }

  public onQuestClick(questId) {
    if (this.selectedQuestId !== questId) {
      this.selectedQuestId = questId;
      this.storageService.setSelectedQuestId(questId);
      this.getActivitiesRequiringManualApproval(this.selectedQuestId);
    } else {
      this.selectedQuestId = '';
      this.storageService.setSelectedQuestId('');
      this.manualApprovalActivities = [];
    }
  }

  public onApproveClick(manualApprovalActivity) {
    const postBody = {
      participantActivityId: manualApprovalActivity._id,
      participantId: manualApprovalActivity.participant_id,
    };

    this.adminService.approveActivity(postBody)
      .subscribe(() => {
        this.getActivitiesRequiringManualApproval(this.selectedQuestId);
      }, error => {
        console.log('error', error);
      });
  }

  ngOnInit() {
    this.getQuests();
    this.selectedQuestId = this.storageService.getSelectedQuestId();
    if (this.selectedQuestId) this.getActivitiesRequiringManualApproval(this.selectedQuestId);
  }
}
