import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  private baseUrl = 'http://localhost:4201/';
  private activityUrl = this.baseUrl.concat('currentActivity');

  constructor(private http:HttpClient) { }

  public getCurrentActivity(participantId): Observable<Object> {
    return this.http.get(this.activityUrl.concat(`?participantId=${participantId}`));
  }
}
