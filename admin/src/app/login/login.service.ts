import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly loginUrl: string;
  private readonly headers: object;

  constructor(
    private http:HttpClient,
    private configService: ConfigService,
  ) {
    this.loginUrl = this.configService.getApiBaseUrl().concat('login');
    this.headers = this.configService.getApiRequestHeaders();
  }

  public login(postBody: {email: string, password: string}) {
    return this.http.post(this.loginUrl, postBody, this.headers)
  }
}
