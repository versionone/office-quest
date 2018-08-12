import { Component, OnInit } from '@angular/core';
import { Quest } from '../quest';
import { AdminService } from '../admin.service';
import {Activity, TriviaQuestionState} from '../activity';
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
  public isTriviaNotAvailable: boolean;
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
        const triviaQuestionState = triviaQuestionResponse as TriviaQuestionState;
        this.currentTriviaQuestion = triviaQuestionState.currentTriviaQuestion;
        this.isTriviaNotAvailable = triviaQuestionState.isTriviaNotAvailable;
        this.isTriviaNotStarted = triviaQuestionState.isTriviaNotStarted;
        this.isTriviaComplete = triviaQuestionState.isTriviaComplete;
      },error => {
        console.log('error', error)
      });
  }

  public onQuestClick(questId) {
    if (this.selectedQuestId !== questId) {
      this.selectedQuestId = questId;
      this.storageService.setSelectedQuestId(questId);
      this.getCurrentTriviaQuestion(questId);
    } else {
      this.selectedQuestId = '';
      this.storageService.setSelectedQuestId('');
      this.currentTriviaQuestion = null;
    }
  }

  public onBeginClick(questId) {
    const postBody = {
      questId: questId,
    };

    this.adminService.activateTriviaQuestion(postBody)
      .subscribe(() => {
        this.getCurrentTriviaQuestion(questId);
      },error => {
        console.log('error', error)
      });
  }

  public onCompleteClick(currentTriviaQuestion) {

  }

  ngOnInit() {
    this.getQuests();
    this.selectedQuestId = this.storageService.getSelectedQuestId();
    if (this.selectedQuestId) this.getCurrentTriviaQuestion(this.selectedQuestId);
  }
}
