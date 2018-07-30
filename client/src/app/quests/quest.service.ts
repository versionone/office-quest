import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})

export class QuestService {

  private readonly questsUrl: string;
  private readonly joinUrl: string;
  private readonly headers: object;

  constructor(
    private http:HttpClient,
    private configService: ConfigService,
    ) {
    this.questsUrl = this.configService.getApiBaseUrl().concat('quests');
    this.joinUrl = this.configService.getApiBaseUrl().concat('quest/join');
    this.headers = this.configService.getApiRequestHeaders();
  }

  public getQuests(): Observable<Object> {
    return this.http.get(this.questsUrl);
  }

  public join(postBody: {questId: string, name: string, email: string}) {
    return this.http.post(this.joinUrl, postBody, this.headers)
  }
}
