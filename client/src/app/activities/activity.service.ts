import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  private readonly currentActivityUrl: string;
  private readonly submitAnswerUrl: string;
  private readonly headers: object;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    ) {
    this.currentActivityUrl = this.configService.getApiBaseUrl().concat('activity/current');
    this.submitAnswerUrl = this.configService.getApiBaseUrl().concat('activity/submitAnswer');
    this.headers = this.configService.getApiRequestHeaders();
  }

  public getCurrentActivity(participantId): Observable<Object> {
    return this.http.get(this.currentActivityUrl.concat(`?participantId=${participantId}`));
  }

  public submitAnswer(postBody: { participantId: string; participantActivityId: string; answer: string }) {
    return this.http.post(this.submitAnswerUrl, postBody, this.headers)
  }
}
