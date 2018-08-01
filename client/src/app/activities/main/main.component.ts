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

  private readonly participantId: string;
  public activity: Activity;
  public type: number;
  public activityType;
  public answer: string;
  public inputIsValid?: boolean = null;
  public answerIsCorrect?: boolean = null;

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
        if (!activity) return;
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

  public onSubmitClick() {
    this.answerIsCorrect = null;
    this.inputIsValid = this.isInputValid();
    if (!this.inputIsValid) return;

    const postBody = {
      participantId: this.participantId,
      participantActivityId: this.activity._id,
      answer: this.answer,
    };

    this.activityService.submitAnswer(postBody)
      .subscribe((response: any) => {
        this.answerIsCorrect = response.isCorrectAnswer
      }, error => {
        console.log('error', error);
      })
  }
}
