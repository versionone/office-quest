import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class QuestService {

  private baseUrl = 'http://localhost:4201/';
  private joinUrl = this.baseUrl.concat('quest/join');
  private headers = { headers: {'Content-Type': 'application/json'} };

  constructor(private http:HttpClient) { }

  public getQuests(): Observable<Object> {
    return this.http.get(this.baseUrl);
  }
  public join(postBody: object) {
    return this.http.post(this.joinUrl, postBody, this.headers)
  }
}
