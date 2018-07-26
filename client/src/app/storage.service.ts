import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  public getParticipantId(): string {
    return localStorage.getItem("participantId");
  }

  public setParticipantId(participant): void {
    localStorage.setItem("participantId", JSON.stringify(participant._id));
  }
}
