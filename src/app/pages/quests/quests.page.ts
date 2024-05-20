import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BarthelsegComponent } from 'src/app/components/barthelseg/barthelseg.component';
import { FacsegComponent } from 'src/app/components/facseg/facseg.component';
import { MonitoringComponent } from 'src/app/components/monitoring/monitoring.component';
import { NeuroQolComponent } from 'src/app/components/neuro-qol/neuro-qol.component';
import { QuestControl } from 'src/app/redcap_interfaces/quest_control';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.page.html',
  styleUrls: ['./quests.page.scss'],
})
export class QuestsPage implements OnInit {

  id: string
  public currentDate: Date;

  firstMonitoring;
  firstBarthelseg;
  firstFacseg;
  firstNeuroQol;

  nextMonitoringDate;
  nextBarthelsegDate;
  nextFacsegDate;
  nextNeuroQolDate;

  isEnabledMonitoring: string;
  isEnabledBarthelseg: string;
  isEnabledFacseg: string;
  isEnabledNeuroQol: string;

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) {
    this.currentDate = new Date()

    this.nextMonitoringDate = null;
    this.nextBarthelsegDate = null;
    this.nextFacsegDate = null;
    this.nextNeuroQolDate = null;

    this.isEnabledMonitoring = "0"
    this.isEnabledBarthelseg = "0"
    this.isEnabledFacseg = "0"
    this.isEnabledNeuroQol = "0"
  }

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.getEnabledStatus(null)
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  getEnabledStatus(event) {

    this.questsSrvc.getEnabledStatus(this.id).subscribe(({ enabledQuests, nextDates }) => {
      
      this.isEnabledMonitoring = enabledQuests[0]
      this.isEnabledBarthelseg = enabledQuests[1]
      this.isEnabledFacseg = enabledQuests[2]
      this.isEnabledNeuroQol = enabledQuests[3]

      this.nextMonitoringDate = nextDates[0]
      this.nextBarthelsegDate = nextDates[1]
      this.nextFacsegDate = nextDates[2]
      this.nextNeuroQolDate = nextDates[3]

      if (event) {
        event.target.complete();
      }
    });
  }

  async presentMonitoringModal(){
    const modal = await this.modalCntrl.create({
      component: MonitoringComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getEnabledStatus(null);
    });
  }

  async presentBarthelsegModal(){
    const modal = await this.modalCntrl.create({
      component: BarthelsegComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getEnabledStatus(null);
    });
  }
  
  async presentFacsegModal(){
    const modal = await this.modalCntrl.create({
      component: FacsegComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getEnabledStatus(null);
    });
  }  

  async presentNeuroQoLModal(){
    const modal = await this.modalCntrl.create({
      component: NeuroQolComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getEnabledStatus(null);
    });
  }



}
