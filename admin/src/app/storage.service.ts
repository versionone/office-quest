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
}
