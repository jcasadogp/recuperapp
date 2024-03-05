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

  isEnabledBarthelseg: string;
  isEnabledMonitoring: string;
  isEnabledFacseg: string;

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
    private questsSrvc: QuestsService
  ) { 
    this.id = 118
  }

  ngOnInit() {
    this.getQuestStatus(null)
  }

  getQuestStatus(event) {
    this.questsSrvc.getQuestStatus(this.id).subscribe({
      next: (data: QuestControl) => {
        if(data[0].quest_control == 0){
          // Control automático : calcular fechas
          
        } else {
          this.isEnabledBarthelseg = data[0].barthelseg_enabled
          this.isEnabledMonitoring = data[0].monitoring_enabled
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
  
  async presentFacsegModal(){
    const modal = await this.modalCntrl.create({
      component: FacsegComponent
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

  async presentNeuroQoLModal(){
    const modal = await this.modalCntrl.create({
      component: NeuroQolComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getQuestStatus(null);
    });
  }

}
