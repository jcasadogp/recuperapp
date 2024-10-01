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
import { PendingNotificationsComponent } from 'src/app/components/pending-notifications/pending-notifications.component';
import { firstValueFrom } from 'rxjs';

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
    console.log("1. Enter nOnInit");
    this.getRecordID().then(data => {
      console.log("3. Already called getRecordID", data)
      this.id = data
      console.log("4. this.id", this.id)
      this.getParticipant(null)
      this.getQuestStatus(null) //Inicia quest service desde home para obtener el número del ion badge de tabs
      this.getEvaData(null)
    })
  }

  // ngOnInit() {
  //   this.initializeData();
  // }
  
  async initializeData(): Promise<void> {
    try {
      console.log("1. Enter try in initializeData");
  
      await this.getRecordID(); 
      console.log("3. Call to getRecordID finished", this.id);
  
      await this.getParticipant(null);
      console.log("5. Call to getParticipant finished", this.participant);
  
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  // async getRecordID(): Promise<void> {
  //   try {
  //     console.log("2. Entre try in getRecordID")
  //     let data = await this.storageSrvc.get('RECORD_ID');
  //     this.id = data;
  //     console.log(this.id)
  //   } catch (error) {
  //     console.error('Error retrieving RECORD_ID:', error);
  //     throw error;
  //   }
  // }

  async getRecordID(): Promise<any> {
    console.log("2. Enter getRecordID")
    return await this.storageSrvc.get('RECORD_ID');
  }

  // async getParticipant(event: any): Promise<void> {
  //   try {
  //     console.log("4. Entre try in getParticipant")
  //     const data: Participant[] = await firstValueFrom(this.participantSrvc.getParticipant(this.id));
  //     this.participant = data[0];
  //     console.log(data, this.participant)
  
  //     if (event) event.target.complete();
  //   } catch (error) {
  //     console.error('Error fetching participant:', error);
  //     if (event) event.target.complete();
  //   }
  // }

  getParticipant(event){
    console.log("5. Enter getParticipant")
    this.participantSrvc.getParticipant(this.id).subscribe({
      next: (data: Participant[]) => {
        console.log("6. Already called participant service", data)
        this.participant = data[0];
        console.log("7. this.participant", this.participant)
        
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

  async presentNotificationsModal(){
    const modal = await this.modalCntrl.create({
      component: PendingNotificationsComponent
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
