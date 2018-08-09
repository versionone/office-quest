import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: string = '';
  public password: string = '';
  public inputIsValid?: boolean = null;

  constructor(
    private loginService: LoginService,
    private storageService: StorageService
  ) { }

  private isInputValid() {
    return !!this.email && !!this.password
      && (this.email.toLowerCase().includes('@collab.net') && this.email.length > 11);
  }

  public onLoginClick() {
    this.inputIsValid = this.isInputValid();
    if (!this.inputIsValid) return;

    const postBody = {
      email: this.email,
      password: this.password
    };

    this.loginService.login(postBody)
      .subscribe((result: any) => {
        if (result.isAuthorized) {
          this.storageService.setCredentials(postBody)
        } else {
          this.inputIsValid = false;
        }
      }, error => {
        this.inputIsValid = false;
      })
  }

  ngOnInit() { }
}
