import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private url = "http://localhost:4201/";

  constructor(private http:HttpClient) { }

  getQuests() {
    return this.http.get(this.url);
  }
}
