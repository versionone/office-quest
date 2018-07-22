import { Component, OnInit } from '@angular/core';
import { QuestService } from '../quest.service';
import {Quest} from "../quest";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css'],
  providers: [QuestService],
})
export class JoinComponent implements OnInit {
  quests: Quest[];

  constructor(private questService: QuestService) { }

  ngOnInit() {
    this.getQuests();
  }

  private getQuests() {
    this.questService.getQuests()
      .subscribe(quests => this.quests = quests as Quest[],error => {
        console.log("error", error)
      });
  }
}
