import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ConfigService } from '../config.service';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly activitiesRequiringManualApprovalUrl: string;
  private readonly headers: object;

  constructor(
    private http:HttpClient,
    private configService: ConfigService,
  ) {
    this.activitiesRequiringManualApprovalUrl = this.configService.getApiBaseUrl().concat('activities/requiringManualApproval');
    this.headers = this.configService.getApiRequestHeaders();
  }

  public getActivitiesRequiringManualApproval(): Observable<Object> {
    return this.http.get(this.activitiesRequiringManualApprovalUrl, this.headers);
  }
}
