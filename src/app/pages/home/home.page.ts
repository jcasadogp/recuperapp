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
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LocalNotifService } from 'src/app/services/local-notif/local-notif.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public id: string;
  questFrecuencies: number[];
  questDates;
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
    private notifSrvc: LocalNotifService,
    private storageSrvc: StorageService
  ) {
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]
    this.currentDate = new Date()
    this.currentDate_string = new Date().toLocaleDateString('es-ES', {day: '2-digit',month: 'long',year: 'numeric'})
  }

  ngOnInit() {
    console.log("=> 2-A. Enter ngOnInit");
    this.initializeData();
  }
  
  async initializeData() {
    try {
      // Step 1: Get Record ID
      this.id = await this.getRecordID();
      console.log("=> 2-C. Already called getRecordID - ", this.id);
  
      await this.getParticipant(null);
      await this.getEvaData(null);
      await this.sendNotifications();
      await this.getQuestStatus(null);
  
      console.log("Initialization completed successfully.");
    } catch (error) {
      console.error("Error during initialization:", error);
    }
    
  }

  async getRecordID(): Promise<any> {
    console.log("=> 2-B. Enter getRecordID")
    return await this.storageSrvc.get('RECORD_ID');
  }

  async getParticipant(event): Promise<void> {
    console.log("=> 2-D. Enter getParticipant");
    try {
      
      const data: Participant[] = await firstValueFrom(this.participantSrvc.getParticipant(this.id));
      console.log("=> 2-E. Already called participant service", data);
      this.participant = data[0];
  
      console.log("=> 2-F. this.participant", this.participant);
  
      if (event) event.target.complete();
    } catch (err) {
      console.log(err);
      if (event) event.target.complete();
    }
  }

  async getEvaData(event): Promise<void> {
    console.log("=> 2-G. Enter getEvaData");
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
    console.log("=> 2-I. Enter getQuestStatus");
    try {
        const data = await firstValueFrom(this.questsSrvc.getEnabledStatus(this.id));
        let enabledQuests = data.enabledQuests;
        let nextDate = data.nextDate;

    } catch (err) {
        console.log(err);
    }
  }

  async sendNotifications() {
    console.log("=> 2-H. Enter sendNotifications");
    var first_time_device = await this.storageSrvc.get("FIRST_TIME_DEVICE")
    if(first_time_device = "1"){
      var surgery_date = await this.storageSrvc.get("SURGERY_DATE")

      this.notifSrvc.scheduleNotification(this.participant.f645_firstname, surgery_date)
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
