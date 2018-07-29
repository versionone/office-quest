import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  public getApiBaseUrl(): string {
    return 'http://localhost:4201/'
  }

  public getApiRequestHeaders(): object {
    return { headers: {'Content-Type': 'application/json'} };
  }
}
