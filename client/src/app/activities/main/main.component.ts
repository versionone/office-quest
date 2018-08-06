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
  private keydownEvents = [];
  public currentActivity: Activity;
  public nextActivity: Activity;
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
      .subscribe((currentActivity) => {
        if (currentActivity) {
          this.currentActivity = currentActivity as Activity;
          this.type = this.currentActivity.type;
        } else {
          this.activityService.getNextActivity(this.participantId)
            .subscribe((nextActivity) => {
              if (!nextActivity) return;
              this.nextActivity = nextActivity as Activity;
              },error => {
                console.log('error', error)
              }
            )
        }
      },error => {
          console.log('error', error)
        }
      );
  }

  ngAfterViewChecked() {
    const elm = document.getElementById('keyReceiver');
    if (elm) {
      elm.focus();
    }
  }

  private isInputValid() {
    return !!this.answer;
  }

  public onChoiceClick(option) {
    this.answer = option;
  }

  public onSubmitClick() {
    this.answerIsCorrect = null;
    this.inputIsValid = this.isInputValid();
    if (!this.inputIsValid) return;

    const postBody = {
      participantId: this.participantId,
      participantActivityId: this.currentActivity._id,
      answer: this.answer,
    };

    if (this.type === this.activityType.Trivia) {
      this.activityService.submitChoice(postBody)
        .subscribe((response: any) => {
          this.answerIsCorrect = response.isCorrectAnswer
        }, error => {
          console.log('error', error);
        })
    } else {
      this.activityService.submitAnswer(postBody)
        .subscribe((response: any) => {
          this.answerIsCorrect = response.isCorrectAnswer
        }, error => {
          console.log('error', error);
        })
    }
  }

  public onKeydown(e) {
    if (!(this.type === this.activityType.GUI)) return;

    this.keydownEvents.push(e.which || e.keyCode || 0);
    if (!(this.keydownEvents.length === this.currentActivity.faux.length)) return;
    const correctKeys = [];

    this.keydownEvents.forEach((code, idx) => {
      if ((this.currentActivity.faux[idx] / 2) === code) {
        correctKeys.push(code);
      }
    });

    if (!(correctKeys.length === this.currentActivity.faux.length)) {
      this.keydownEvents = [];
      return;
    }

    const postBody = {
      participantId: this.participantId,
      participantActivityId: this.currentActivity._id,
      answer: correctKeys,
    };

    this.activityService.submitKeys(postBody)
      .subscribe((response: any) => {
        if (!response.isCorrectAnswer) {
          this.keydownEvents = [];
          return;
        }
        this.answerIsCorrect = response.isCorrectAnswer
      }, error => {
        console.log('error', error);
      })
  }
}
