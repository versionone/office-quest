import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  public getCredentials(): string {
    return JSON.parse(localStorage.getItem("credentials"));
  }

  public setCredentials(credentials): void {
    localStorage.setItem("credentials", JSON.stringify(credentials));
  }

  public getSelectedQuestId(): string {
    return JSON.parse(localStorage.getItem("selectedQuestId"));
  }

  setSelectedQuestId(questId: string) {
    localStorage.setItem("selectedQuestId", JSON.stringify(questId));
  }
}
