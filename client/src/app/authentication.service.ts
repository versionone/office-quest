import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public hasToken(): boolean {
    return !!localStorage.getItem("authenticationToken");
  }
}
