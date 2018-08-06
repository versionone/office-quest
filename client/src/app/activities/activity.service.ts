import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  private readonly currentActivityUrl: string;
  private readonly nextActivityUrl: string;
  private readonly submitAnswerUrl: string;
  private readonly submitChoiceUrl: string;
  private readonly submitKeysUrl: string;
  private readonly headers: object;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    ) {
    this.currentActivityUrl = this.configService.getApiBaseUrl().concat('activity/current');
    this.nextActivityUrl = this.configService.getApiBaseUrl().concat('activity/next');
    this.submitAnswerUrl = this.configService.getApiBaseUrl().concat('activity/submitAnswer');
    this.submitChoiceUrl = this.configService.getApiBaseUrl().concat('activity/submitChoice');
    this.submitKeysUrl = this.configService.getApiBaseUrl().concat('activity/submitKeys');
    this.headers = this.configService.getApiRequestHeaders();
  }

  public getCurrentActivity(participantId: string): Observable<Object> {
    return this.http.get(this.currentActivityUrl.concat(`?participantId=${participantId}`));
  }

  getNextActivity(participantId: string): Observable<Object> {
    return this.http.get(this.nextActivityUrl.concat(`?participantId=${participantId}`));
  }

  public submitAnswer(postBody: { participantId: string; participantActivityId: string; answer: string }) {
    return this.http.post(this.submitAnswerUrl, postBody, this.headers)
  }

  public submitChoice(postBody: { participantId: string; participantActivityId: string; answer: string }) {
    return this.http.post(this.submitChoiceUrl, postBody, this.headers)
  }

  public submitKeys(postBody: { participantId: string; participantActivityId: string; answer: any }) {
    return this.http.post(this.submitKeysUrl, postBody, this.headers)
  }
}
