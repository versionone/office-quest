import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { StorageService } from '../../storage.service';
import { Activity } from '../activity';

@Component({
  selector: 'app-main-activity',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [
    ActivityService,
    StorageService,
  ]
})

export class MainComponent implements OnInit {

  private participantId: string;
  protected activity: Activity;

  constructor(
    private activityService: ActivityService,
    private storageService: StorageService,
  ) {
    this.participantId = JSON.parse(this.storageService.getParticipantId());
  }

  ngOnInit() {
    this.activityService.getCurrentActivity(this.participantId)
      .subscribe(activity => this.activity = activity as Activity,error => {
        console.log('error', error)
      });
  }
}
