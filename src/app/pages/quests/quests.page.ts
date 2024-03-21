import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BarthelsegComponent } from 'src/app/components/barthelseg/barthelseg.component';
import { FacsegComponent } from 'src/app/components/facseg/facseg.component';
import { MonitoringComponent } from 'src/app/components/monitoring/monitoring.component';
import { NeuroQolComponent } from 'src/app/components/neuro-qol/neuro-qol.component';
import { QuestControl } from 'src/app/redcap_interfaces/quest_control';
import { QuestsService } from 'src/app/services/quests/quests.service';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.page.html',
  styleUrls: ['./quests.page.scss'],
})
export class QuestsPage implements OnInit {

  id: number
  public currentDate;
  questFrecuencies: number[];

  firstMonitoring;
  firstBarthelseg;
  firstFacseg;

  nextMonitoringDate;
  nextBarthelsegDate;
  nextFacsegDate;

  isEnabledMonitoring: string;
  isEnabledBarthelseg: string;
  isEnabledFacseg: string;

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
    private questsSrvc: QuestsService
  ) { 
    this.id = 118
    this.currentDate = new Date()
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]

    this.nextMonitoringDate = null;
    this.nextBarthelsegDate = null;
    this.nextFacsegDate = null;

    this.isEnabledMonitoring = "0"
    this.isEnabledBarthelseg = "0"
    this.isEnabledFacseg = "0"
  }

  ngOnInit() {
    this.getQuestStatus(null)
  }

  getQuestStatus(event) {
    this.questsSrvc.getQuestStatus(this.id).subscribe({
      next: (data: QuestControl) => {
        if(data[0].quest_control == 0){ // Automático

          this.firstMonitoring = new Date(data[0].monitoring_date_1)
          this.firstBarthelseg = new Date(data[0].barthelseg_date_1)
          this.firstFacseg = new Date(data[0].facseg_date_1)

          for(let f of this.questFrecuencies){
            // Monitoring
            let updateMonitoringDate = new Date(this.firstMonitoring.getTime());
            updateMonitoringDate.setMonth(updateMonitoringDate.getMonth() + f);
            this.isEnabledMonitoring = this.datesAreEqual(updateMonitoringDate, this.currentDate) ? "1" : this.isEnabledMonitoring;
            this.nextMonitoringDate = (this.nextMonitoringDate == null && updateMonitoringDate > this.currentDate) ? updateMonitoringDate.toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'}) : this.nextMonitoringDate;
            // console.log(f, this.isEnabledMonitoring, this.nextMonitoringDate)

            // Barthelseg
            let updateBarthelsegDate = new Date(this.firstBarthelseg.getTime());
            updateBarthelsegDate.setMonth(updateBarthelsegDate.getMonth() + f);
            this.isEnabledBarthelseg = this.datesAreEqual(updateBarthelsegDate, this.currentDate) ? "1" : this.isEnabledBarthelseg;
            this.nextBarthelsegDate = (this.nextBarthelsegDate == null && updateBarthelsegDate > this.currentDate) ? updateBarthelsegDate.toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'}) : this.nextBarthelsegDate;
            // console.log(f, this.isEnabledBarthelseg, this.nextBarthelsegDate)
            
            // Facseg
            let updateFacsegDate = new Date(this.firstFacseg.getTime());
            updateFacsegDate.setMonth(updateFacsegDate.getMonth() + f);
            this.isEnabledFacseg = this.datesAreEqual(updateFacsegDate, this.currentDate) ? "1" : this.isEnabledFacseg;
            this.nextFacsegDate = (this.nextFacsegDate == null && updateFacsegDate > this.currentDate) ? updateFacsegDate.toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'}) : this.nextFacsegDate;
            // console.log(f, this.isEnabledFacseg, this.nextFacsegDate)
          }
        } else { //Manual
          this.isEnabledMonitoring = data[0].monitoring_enabled
          this.isEnabledBarthelseg = data[0].barthelseg_enabled
          this.isEnabledFacseg = data[0].facseg_enabled
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
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

}
