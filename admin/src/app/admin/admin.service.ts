import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ConfigService } from '../config.service';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly questsUrl: string;
  private readonly activitiesRequiringManualApprovalUrl: string;
  private readonly approveActivityUrl: string;
  private readonly currentTriviaQuestionUrl: string;
  private readonly activateTriviaQuestionUrl: string;
  private readonly headers: object;

  constructor(
    private http:HttpClient,
    private configService: ConfigService,
  ) {
    this.questsUrl = this.configService.getApiBaseUrl().concat('quests');
    this.activitiesRequiringManualApprovalUrl = this.configService.getApiBaseUrl().concat('admin/activities/requiringManualApproval');
    this.approveActivityUrl = this.configService.getApiBaseUrl().concat('admin/activity/approve');
    this.currentTriviaQuestionUrl = this.configService.getApiBaseUrl().concat('admin/triviaQuestion/current');
    this.activateTriviaQuestionUrl = this.configService.getApiBaseUrl().concat('admin/triviaQuestion/activate');
    this.headers = this.configService.getApiRequestHeaders();
  }

  public getQuests(): Observable<Object> {
    return this.http.get(this.questsUrl);
  }

  public getActivitiesRequiringManualApproval(questId: string): Observable<Object> {
    return this.http.get(this.activitiesRequiringManualApprovalUrl.concat(`?questId=${questId}`), this.headers);
  }

  public approveActivity(postBody: { participantActivityId: string; }) {
    return this.http.post(this.approveActivityUrl, postBody, this.headers)
  }

  public getCurrentTriviaQuestion(questId: string): Observable<Object> {
    return this.http.get(this.currentTriviaQuestionUrl.concat(`?questId=${questId}`), this.headers);
  }

  public activateTriviaQuestion(postBody: { questId: string; }) {
    return this.http.post(this.activateTriviaQuestionUrl, postBody, this.headers)
  }
}
