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
  public currentDate;
  questFrecuencies: number[];

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
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]

    this.nextMonitoringDate = null;
    this.nextBarthelsegDate = null;
    this.nextFacsegDate = null;
    this.nextNeuroQolDate = null;

    this.isEnabledMonitoring = "0"
    this.isEnabledBarthelseg = "0"
    this.isEnabledFacseg = "0"
    this.isEnabledNeuroQol = "0"

    console.log(this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol)
  }

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.getQuestStatus(null)
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  getQuestStatus(event) {
    
    this.questsSrvc.getQuestStatus(this.id).subscribe({

      next: (data: QuestControl) => {

        if(data[0].quest_control == 0){ // Automático

          if (data[0].monitoring_date_1 && data[0].monitoring_date_1 !== "") {
            this.checkQuestDate('Monitoring', data[0].monitoring_date_1);
          } else {
            this.isEnabledMonitoring = '1'
          }
          
          if (data[0].barthelseg_date_1 && data[0].barthelseg_date_1 !== "") {
            this.checkQuestDate('Barthelseg', data[0].barthelseg_date_1);
          } else {
            this.isEnabledBarthelseg = '1'
          }
          
          if (data[0].facseg_date_1 && data[0].facseg_date_1 !== "") {
            this.checkQuestDate('Facseg', data[0].facseg_date_1);
          } else {
            this.isEnabledFacseg = '1'
          }
          
          if (data[0].neuroqol_date_1 && data[0].neuroqol_date_1 !== "") {
            this.checkQuestDate('NeuroQol', data[0].neuroqol_date_1);
          } else {
            this.isEnabledNeuroQol = '1'
          }

          console.log(this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol)

        } else { //Manual
          this.isEnabledMonitoring = "1"
          this.isEnabledBarthelseg = "1"
          this.isEnabledFacseg = "1"
          this.isEnabledNeuroQol = "1"
        }
        if (event) event.target.complete();
      },
      error: (err) => {
        console.log(err)
        if (event) event.target.complete();
      },
      complete: () => {}
    })
  }

  checkQuestDate(prefix, first_data_date) {

    let firstDate = `first${prefix}`;
    let isEnabled = `isEnabled${prefix}`;
    let nextDate = `next${prefix}Date`;

    this[firstDate] = new Date(first_data_date)
    
    for (let f of this.questFrecuencies) {
      let updateDate = new Date(this[firstDate].getTime());
      updateDate.setMonth(updateDate.getMonth() + f);
      
      // console.log('*', updateDate, this.currentDate)
      this[isEnabled] = this.datesAreEqual(updateDate, this.currentDate) ? "1" : "0";
      this[isEnabled] = (f == this.questFrecuencies.pop() && updateDate < this.currentDate) ? "2" : this[isEnabled];
      this[nextDate] = (this[nextDate] == null && updateDate >= this.currentDate) ? updateDate.toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'}) : this[nextDate];

      // console.log('*', this[isEnabled], this.isEnabledFacseg)
    }

  }

  async presentMonitoringModal(){
    const modal = await this.modalCntrl.create({
      component: MonitoringComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getQuestStatus(null);
    });
  }

  async presentBarthelsegModal(){
    const modal = await this.modalCntrl.create({
      component: BarthelsegComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getQuestStatus(null);
    });
  }
  
  async presentFacsegModal(){
    const modal = await this.modalCntrl.create({
      component: FacsegComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getQuestStatus(null);
    });
  }  

  async presentNeuroQoLModal(){
    const modal = await this.modalCntrl.create({
      component: NeuroQolComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getQuestStatus(null);
    });
  }

  datesAreEqual(date1, date2) {
    // console.log('-', date1.getDate(), date2.getDate(), "Are equal?", date1.getDate() === date2.getDate())
    // console.log('-', date1.getMonth(), date2.getMonth(), "Are equal?", date1.getMonth() === date2.getMonth())
    // console.log('-', date1.getFullYear(), date2.getFullYear(), "Are equal?", date1.getFullYear() === date2.getFullYear())
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

}
