import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  constructor(
    private storageService: StorageService,
  ) { }

  public getApiBaseUrl(): string {
    return 'http://localhost:4201/admin/'
  }

  public getApiRequestHeaders(): object {
    const headers = { headers: {'Content-Type': 'application/json'} };
    const credentials = this.storageService.getCredentials();

    if (credentials) {
      headers['headers']['Email'] = credentials['email'];
      headers['headers']['Password'] = credentials['password']
    }

    return headers;
  }
}
