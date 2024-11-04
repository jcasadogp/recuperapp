import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BarthelsegComponent } from 'src/app/components/barthelseg/barthelseg.component';
import { FacsegComponent } from 'src/app/components/facseg/facseg.component';
import { MonitoringComponent } from 'src/app/components/monitoring/monitoring.component';
import { NeuroQolComponent } from 'src/app/components/neuro-qol/neuro-qol.component';
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

  nextDate;

  isEnabledMonitoring: string;
  isEnabledBarthelseg: string;
  isEnabledFacseg: string;
  isEnabledNeuroQol: string;

  constructor(
    private modalCntrl: ModalController,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) {
    this.currentDate = new Date()

    this.nextDate = "..."

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
    console.log("2. Dentro de getEnabledStatus")

    this.questsSrvc.getEnabledStatus(this.id).subscribe(({ enabledQuests, nextDate }) => {
      
      this.isEnabledMonitoring = enabledQuests[0]
      this.isEnabledBarthelseg = enabledQuests[1]
      this.isEnabledFacseg = enabledQuests[2]
      this.isEnabledNeuroQol = enabledQuests[3]

      if (nextDate) {
        this.nextDate = new Date(nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
      } else {
        this.nextDate = null;
      }

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
      console.log("1. Dentro de onDidDismiss - monitoring")
      this.getEnabledStatus(null);
    });
  }

  async presentBarthelsegModal(){
    const modal = await this.modalCntrl.create({
      component: BarthelsegComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      console.log("1. Dentro de onDidDismiss - barthel")
      this.getEnabledStatus(null);
    });
  }
  
  async presentFacsegModal(){
    const modal = await this.modalCntrl.create({
      component: FacsegComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      console.log("1. Dentro de onDidDismiss - facseg")
      this.getEnabledStatus(null);
    });
  }  

  async presentNeuroQoLModal(){
    const modal = await this.modalCntrl.create({
      component: NeuroQolComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      console.log("1. Dentro de onDidDismiss - neuroqol")
      this.getEnabledStatus(null);
    });
  }



}
