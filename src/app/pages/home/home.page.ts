import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { InformationComponent } from 'src/app/components/information/information.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { EvaComponent } from 'src/app/components/eva/eva.component';
import { Participant } from 'src/app/redcap_interfaces/participant';
import { ParticipantService } from 'src/app/services/participant/participant.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { EvaService } from 'src/app/services/eva/eva.service';
import { Eva } from 'src/app/redcap_interfaces/eva';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public id: string;
  public participant: Participant = {};
  public currentDate;
  public currentDate_string: string;

  public notifyEva: boolean

  constructor(
    private questsSrvc: QuestsService,
    private evaSrvc: EvaService,
    private router: Router,
    private modalCntrl: ModalController,
    private participantSrvc: ParticipantService,
    private storageSrvc: StorageService
  ) {
    this.currentDate = new Date()
    this.currentDate_string = new Date().toLocaleDateString('es-ES', {day: '2-digit',month: 'long',year: 'numeric'})
  }

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.getParticipant(null)
      this.getQuestStatus(null) //Inicia quest service desde home para obtener el número del ion badge de tabs
      this.getEvaData(null)
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  getParticipant(event){
    this.participantSrvc.getParticipant(this.id).subscribe({
      next: (data: Participant[]) => {
        this.participant = data[0];
        
        if (event) event.target.complete();
      },
      error: (err) => {
        console.log(err)
        if (event) event.target.complete();
      },
      complete: () => {}
    })
  }

  getQuestStatus(event) {

    this.questsSrvc.getEnabledStatus(this.id).subscribe(data => {
      let enabledQuests = data;
    });
  }

  getEvaData(event) {
    this.evaSrvc.getEvaData(this.id).subscribe({
      next: (data: Eva[]) => {
        if(Object.keys(data).length > 0){
          let lastEvaDate = new Date(data[Object.keys(data).length-1].fecha_eva)
          let updateDate = new Date(lastEvaDate.getTime());
          updateDate.setDate(updateDate.getDate() + 7);

          this.notifyEva = this.currentDate >= updateDate;

        } else {
          this.notifyEva = true
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

  async presentProfileModal(){
    const modal = await this.modalCntrl.create({
      component: ProfileComponent
    });
    return await modal.present();
  }

  async presentInformationModal(){
    const modal = await this.modalCntrl.create({
      component: InformationComponent
    });
    return await modal.present();
  }

  async presentEvaModal(){
    const modal = await this.modalCntrl.create({
      component: EvaComponent
    });
    await modal.present();

    modal.onDidDismiss().then(() => {
      this.getEvaData(null)
    });
  }

  async logout(): Promise<any> {
    try {
      await this.storageSrvc.remove('RECORD_ID');
      this.router.navigateByUrl('login')
    }
    catch(e) { console.log(e) }
  }
}
