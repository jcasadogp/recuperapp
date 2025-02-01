import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { InformationComponent } from 'src/app/components/information/information.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { EvaComponent } from 'src/app/components/eva/eva.component';
import { BaselineData, Participant } from 'src/app/redcap_interfaces/participant';
import { ParticipantService } from 'src/app/services/participant/participant.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { EvaService } from 'src/app/services/eva/eva.service';
import { Eva } from 'src/app/redcap_interfaces/eva';
import { PendingNotificationsComponent } from 'src/app/components/pending-notifications/pending-notifications.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LocalNotifService } from 'src/app/services/local-notif/local-notif.service';
import { DataService } from 'src/app/services/data/data.service';
import { Login } from 'src/app/redcap_interfaces/login';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public id: string;
  questFrecuencies: number[];
  public participant: Participant = {};
  public currentDate;
  public currentDate_string: string;

  public notifyEva: boolean

  constructor(
    private dataSrvc: DataService,
    private questsSrvc: QuestsService,
    private evaSrvc: EvaService,
    private router: Router,
    private modalCntrl: ModalController,
    private participantSrvc: ParticipantService,
    private notifSrvc: LocalNotifService,
    private storageSrvc: StorageService
  ) {
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]
    this.currentDate = new Date()
    this.currentDate_string = new Date().toLocaleDateString('es-ES', {day: '2-digit',month: 'long',year: 'numeric'})
  }

  ngOnInit() {
    console.log("1. Enter ngOnInit");
    this.initializeData();
  }
  
  async initializeData() {
    try {
      const data = await this.getRecordID();
      console.log("3. Already called getRecordID", data);
      this.id = data;
      console.log("4. this.id", this.id);
  
      // Wait for getBaselineData to complete before calling the others
      await this.getBaselineData(null);
      await this.getParticipant(null);
      await this.getEvaData(null);
      await this.sendNotifications();
      await this.getQuestStatus(null);
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  async getRecordID(): Promise<any> {
    console.log("2. Enter getRecordID")
    return await this.storageSrvc.get('RECORD_ID');
  }

  async getBaselineData(event): Promise<void> {
    try {
      const data: BaselineData = await firstValueFrom(this.participantSrvc.getBaselineData(this.id));
      let surgery_date = data[0].f_cirug_a;
      await this.storageSrvc.set('SURGERY_DATE', surgery_date);
  
      let questDates = {};
      this.questFrecuencies.forEach(f => {
        let date = new Date(surgery_date);
        date.setMonth(date.getMonth() + f);
        questDates[f] = date.toISOString().split('T')[0];
      });
      await this.storageSrvc.set('QUEST_DATES', questDates);
  
      if (event) event.target.complete();
    } catch (err) {
      console.log(err);
      if (event) event.target.complete();
    }
  }
  
  async getParticipant(event): Promise<void> {
    console.log("5. Enter getParticipant");
    try {
      // Get the participant data as a single object
      const data: Participant[] = await firstValueFrom(this.participantSrvc.getParticipant(this.id));
      console.log("6. Already called participant service", data);
      this.participant = data[0];
  
      console.log("7. this.participant", this.participant);
  
      if (event) event.target.complete();
    } catch (err) {
      console.log(err);
      if (event) event.target.complete();
    }
  }

  async getEvaData(event): Promise<void> {
    try {
      // Convert the Observable to a Promise and await the result
      const data: Eva[] = await firstValueFrom(this.evaSrvc.getEvaData(this.id));
  
      if (data.length > 0) {
        // Assuming the last element is the one you're interested in
        let lastEvaDate = new Date(data[data.length - 1].fecha_eva);
        let updateDate = new Date(lastEvaDate.getTime());
        updateDate.setDate(updateDate.getDate() + 7);
  
        this.notifyEva = this.currentDate >= updateDate;
      } else {
        this.notifyEva = true;
      }
  
      if (event) event.target.complete();
    } catch (err) {
      console.log(err);
      if (event) event.target.complete();
    }
  }

  async getQuestStatus(event): Promise<void> {
    try {
        const data = await firstValueFrom(this.questsSrvc.getEnabledStatus(this.id));
        let enabledQuests = data.enabledQuests;
        let nextDate = data.nextDate;

    } catch (err) {
        console.log(err);
    }
  }

  async sendNotifications() {
    var first_time_device = await this.storageSrvc.get("FIRST_TIME_DEVICE")
    if(first_time_device = "1"){
      var surgery_date = await this.storageSrvc.get("SURGERY_DATE")

      this.notifSrvc.scheduleNotification(this.participant.f645_firstname, surgery_date)
      
      // var import_data: Login[] = [
      //   {
      //     record_id: this.id,
      //     logged_once: 1
      //   }
      // ];

      // await lastValueFrom(this.dataSrvc.import(import_data));
    }
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
    catch (err) {
      console.log(err);
    }
  }
}
