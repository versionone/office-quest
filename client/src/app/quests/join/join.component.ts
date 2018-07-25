import { Component, OnInit } from '@angular/core';
import { QuestService } from '../quest.service';
import { StorageService } from '../../storage.service';
import { Quest } from '../quest';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css'],
  providers: [
    QuestService,
    StorageService,
  ],
})

export class JoinComponent implements OnInit {

  protected quests: Quest[];
  protected name: string = '';
  protected email: string = '';
  protected inputIsValid?: boolean = null;

  constructor(
    private questService: QuestService,
    private storageService: StorageService
  ) { }

  private getQuests(): void {
    this.questService.getQuests()
      .subscribe(quests => this.quests = quests as Quest[],error => {
        console.log('error', error)
      });
  }

  private isInputValid() {
    return !!this.name &&
      (!!this.email && this.email.toLowerCase().includes('@collab.net') && this.email.length > 11);
  }

  protected onJoinClick() {
    this.inputIsValid = this.isInputValid();
    if (!this.inputIsValid) return;

    const postBody = {
      questId: this.quests[0]._id,
      name: this.name,
      email: this.email,
    };

    this.questService.join(postBody)
      .subscribe((participant) => {
        console.log('participant', participant);
        this.storageService.saveParticipantId(participant)
      }, error => {
        console.log('error', error);
      })
  }

  ngOnInit() {
    this.getQuests();
  }
}
