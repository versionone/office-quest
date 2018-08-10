import { Component } from '@angular/core';
import { StorageService } from './storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    StorageService,
  ]
})

export class AppComponent {

  constructor(private storageService: StorageService) { }

  public isAuthenticated(): boolean {
    return !!this.storageService.getCredentials();
  }
}
