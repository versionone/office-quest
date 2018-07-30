import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { StorageService } from '../../storage.service';
import {
  Activity,
  ActivityType,
} from '../activity';

@Component({
  selector: 'app-main-activity',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [
    ActivityService,
    StorageService,
  ]
})

export class MainComponent implements OnInit {

  private participantId: string;
  protected activity: Activity;
  protected type: number;
  protected activityType;
  protected answer: string;
  protected inputIsValid?: boolean = null;

  constructor(
    private activityService: ActivityService,
    private storageService: StorageService,
  ) {
    this.activityType = ActivityType;
    this.participantId = JSON.parse(this.storageService.getParticipantId());
  }

  ngOnInit() {
    this.activityService.getCurrentActivity(this.participantId)
      .subscribe((activity) => {
        this.activity = activity as Activity;
        this.type = this.activity.type;
      },error => {
          console.log('error', error)
        }
      );
  }

  private isInputValid() {
    return !!this.answer;
  }

  protected onSubmitClick() {
    this.inputIsValid = this.isInputValid();
    if (!this.inputIsValid) return;

    const postBody = {
      participantActivityId: this.activity._id,
      answer: this.answer,
    };

    this.activityService.submitAnswer(postBody)
      .subscribe((participant) => {
        this.storageService.setParticipantId(participant)
      }, error => {
        console.log('error', error);
      })
  }
}
