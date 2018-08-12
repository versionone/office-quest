import { Component, OnInit } from '@angular/core';
import { Quest } from '../quest';
import { AdminService } from '../admin.service';
import { Activity } from '../activity';
import { StorageService } from '../../storage.service';
import { ActivityType } from '../../../../../client/src/app/activities/activity';

@Component({
  selector: 'app-trivia',
  templateUrl: './trivia.component.html',
  styleUrls: ['./trivia.component.css']
})
export class TriviaComponent implements OnInit {

  public quests: Quest[];
  public selectedQuestId: string;
  public isTriviaNotStarted: boolean;
  public isTriviaComplete: boolean;
  public currentTriviaQuestion: Activity;
  public type: number;
  public activityType;
  public answer: string;
  public inputIsValid?: boolean = null;
  public answerIsCorrect?: boolean = null;

  constructor(
    private adminService: AdminService,
    private storageService: StorageService,
  ) {
    this.activityType = ActivityType;
  }

  private getQuests(): void {
    this.adminService.getQuests()
      .subscribe(quests => this.quests = quests as Quest[],error => {
        console.log('error', error)
      });
  }

  private getCurrentTriviaQuestion(questId) {
    this.adminService.getCurrentTriviaQuestion(questId)
      .subscribe((triviaQuestionResponse) => {
        console.log('triviaQuestionResponse', triviaQuestionResponse);
        const activity = triviaQuestionResponse as Activity;
        if (activity.isTriviaNotStarted) {
          this.isTriviaNotStarted = activity.isTriviaNotStarted;
        } else if (activity.isTriviaComplete) {
          this.isTriviaComplete = activity.isTriviaComplete;
          this.currentTriviaQuestion = null;
        } else {
          this.currentTriviaQuestion = activity;
          this.isTriviaNotStarted = false;
        }
      },error => {
        console.log('error', error)
      });
  }

  public onQuestClick(questId) {
    if (this.selectedQuestId !== questId) {
      this.selectedQuestId = questId;
      this.storageService.setSelectedQuestId(questId);
    } else {
      this.selectedQuestId = '';
      this.storageService.setSelectedQuestId('');
    }
  }

  public onBeginClick(questId) {

  }

  public onCompleteClick(currentTriviaQuestion) {

  }

  ngOnInit() {
    this.getQuests();
    this.selectedQuestId = this.storageService.getSelectedQuestId();
    if (this.selectedQuestId) this.getCurrentTriviaQuestion(this.selectedQuestId);
  }
}
