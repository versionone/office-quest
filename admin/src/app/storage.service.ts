import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  public getAdministratorId(): string {
    return localStorage.getItem("administratorId");
  }

  public setAdministratorId(administrator): void {
    localStorage.setItem("administratorId", JSON.stringify(administrator._id));
  }
}
