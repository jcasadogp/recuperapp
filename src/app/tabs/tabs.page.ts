import { Component } from '@angular/core';
import { QuestsService } from '../services/quests/quests.service';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  id: string
  num_quests: number
  
  constructor(
    private storageSrvc: StorageService,
    private questsSrvc: QuestsService
  ) {
    this.questsSrvc.questFilled.subscribe(() => {
      this.num_quests = this.questsSrvc.getNumEnabledQuests()
    });
  }

  ngOnInit(): void {
    this.num_quests = this.questsSrvc.getNumEnabledQuests()
  }
}
