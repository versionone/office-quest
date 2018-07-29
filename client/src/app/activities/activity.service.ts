import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  private readonly activityUrl;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    ) {
    this.activityUrl = this.configService.getApiBaseUrl().concat('currentActivity');
  }

  public getCurrentActivity(participantId): Observable<Object> {
    return this.http.get(this.activityUrl.concat(`?participantId=${participantId}`));
  }
}
