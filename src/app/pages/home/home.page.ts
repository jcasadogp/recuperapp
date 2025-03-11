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
    this.currentDate = new Date()
    this.currentDate_string = new Date().toLocaleDateString('es-ES', {day: '2-digit',month: 'long',year: 'numeric'})
  }

  /**
   * Lifecycle hook that runs when the component is initialized.
   * 
   * - Logs the initialization step for debugging.
   * - Calls `initializeData()` to set up necessary data when the component loads.
   */
  ngOnInit() {
    console.log("=> 2-A. Enter ngOnInit");
    this.initializeData();
  }
  
  /**
   * Asynchronously initializes data for the component.
   * 
   * - Retrieves the participant's record ID.
   * - Fetches participant data, evaluation data, and questionnaire status.
   * - Sends notifications as needed.
   * - Logs progress for debugging and handles errors gracefully.
   */
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

  /**
   * Retrieves the stored participant record ID asynchronously.
   * 
   * - Logs entry into the function for debugging purposes.
   * - Fetches the record ID from local storage.
   * - Returns the retrieved ID as a promise.
   * 
   * @returns {Promise<any>} The stored record ID.
   */
  async getRecordID(): Promise<any> {
    console.log("=> 2-B. Enter getRecordID")
    return await this.storageSrvc.get('RECORD_ID');
  }

  /**
   * Retrieves participant data asynchronously based on the stored participant ID.
   * 
   * - Logs entry into the function for debugging.
   * - Calls the participant service to fetch data.
   * - Stores the first participant record in the `this.participant` variable.
   * - Completes the event (if provided) to indicate the process is finished.
   * - Catches and logs errors if retrieval fails.
   * 
   * @param {any} event - Optional event parameter, used to signal completion in UI components.
   * @returns {Promise<void>} A promise indicating the function execution status.
   */
  async getParticipant(event): Promise<void> {
    console.log("=> 2-D. Enter getParticipant");
    try {
      
      const data: Participant[] = await firstValueFrom(this.participantSrvc.getParticipant(this.id));
      console.log("=> 2-E. Already called participant service", data);
      this.participant = data[0];
  
      console.log("=> 2-F. this.participant", this.participant);
  
      if (event) event.target.complete();
    } catch (error) {
      console.error("Error fetching participants data:", error);
      if (event) event.target.complete();
    }
  }

  /**
   * Retrieves and processes EVA (pain level) data asynchronously.
   * 
   * - Logs function entry for debugging.
   * - Fetches EVA data for the stored participant ID.
   * - Determines whether a new EVA notification should be triggered based on the last recorded date.
   * - Completes the event (if provided) to signal UI update.
   * - Catches and logs errors in case of failures.
   * 
   * @param {any} event - Optional event parameter, used to signal completion in UI components.
   * @returns {Promise<void>} A promise indicating the function execution status.
   */
  async getEvaData(event): Promise<void> {
    console.log("=> 2-G. Enter getEvaData");
    try {
      // Convert the Observable to a Promise and await the result
      const data: Eva[] = await firstValueFrom(this.evaSrvc.getEvaData(this.id));
      
      if (data.length > 0) {
        // Assuming the last element is the most recent EVA record
        let lastEvaDate = new Date(data[data.length - 1].fecha_eva);
        let updateDate = new Date(lastEvaDate.getTime());
        updateDate.setDate(updateDate.getDate() + 7);
        
        // Determine if a new notification should be triggered
        this.notifyEva = this.currentDate >= updateDate;
      } else {
        // If no EVA data exists, trigger notification
        this.notifyEva = true;
      }
      
      if (event) event.target.complete();
    } catch (error) {
      console.error("Error fetching EVA data:", error);
      if (event) event.target.complete();
    }
  }

  /**
   * Retrieves and processes the enabled status of questionnaires asynchronously.
   * 
   * - Logs function entry for debugging.
   * - Fetches the questionnaire status for the stored participant ID.
   * - Catches and logs errors in case of failures.
   * - Ensures event completion if provided, to update the UI properly.
   * 
   * @param {any} event - Optional event parameter, used to signal completion in UI components.
   * @returns {Promise<void>} A promise indicating the function execution status.
   */
  async getQuestStatus(event): Promise<void> {
    console.log("=> 2-I. Enter getQuestStatus");
    try {
      // Fetch the enabled questionnaire status for the user
      await firstValueFrom(this.questsSrvc.getEnabledStatus(this.id));
    } catch (error) {
      console.log("Error fetching questionnaire status:", error);
    } finally {
      // Ensure event completion for UI responsiveness
      if (event) event.target.complete();
    }
  }

  /**
   * Schedules notifications for the participant based on their surgery date.
   * 
   * - Logs function entry for debugging.
   * - Checks if the device is being used for the first time.
   * - Retrieves the stored surgery date.
   * - Calls the notification service to schedule reminders.
   * 
   * @returns {Promise<void>} A promise indicating the function execution status.
   */
  async sendNotifications() {
    console.log("=> 2-H. Enter sendNotifications");

    try {
      // Check if the device is being used for the first time
      const firstTimeDevice = await this.storageSrvc.get("FIRST_TIME_DEVICE");
      
      if (firstTimeDevice === "1") {
        // Retrieve the stored surgery date
        const surgeryDate = await this.storageSrvc.get("SURGERY_DATE");
        
        // Schedule a notification using the participant's first name and surgery date
        this.notifSrvc.scheduleNotification(this.participant.f645_firstname, surgeryDate);
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  /**
   * Presents a modal displaying the user's profile.
   * 
   * - Creates a modal using the `ProfileComponent`.
   * - Presents the modal to the user.
   * 
   * @returns {Promise<void>} A promise that resolves when the modal is presented.
   */
  async presentProfileModal(): Promise<void> {
    try {
      const modal = await this.modalCntrl.create({
        component: ProfileComponent
      });
      await modal.present();
    } catch (error) {
      console.error("Error presenting profile modal:", error);
    }
  }

  /**
   * Presents a modal displaying general information.
   * 
   * @returns {Promise<void>} A promise that resolves when the modal is presented.
   */
  async presentInformationModal(): Promise<void> {
    try {
      const modal = await this.modalCntrl.create({
        component: InformationComponent
      });
      await modal.present();
    } catch (error) {
      console.error("Error presenting information modal:", error);
    }
  }

  /**
  * Presents a modal displaying pending notifications.
  * 
  * @returns {Promise<void>} A promise that resolves when the modal is presented.
  */
  async presentNotificationsModal(): Promise<void> {
    try {
      const modal = await this.modalCntrl.create({
        component: PendingNotificationsComponent
      });
      await modal.present();
    } catch (error) {
      console.error("Error presenting notifications modal:", error);
    }
  }

  /**
  * Presents a modal for EVA (pain level) input and refreshes EVA data upon dismissal.
  * 
  * @returns {Promise<void>} A promise that resolves when the modal is presented.
  */
  async presentEvaModal(): Promise<void> {
    try {
      const modal = await this.modalCntrl.create({
        component: EvaComponent
      });
      await modal.present();
      
      modal.onDidDismiss().then(() => {
        this.getEvaData(null);
      });
    } catch (error) {
      console.error("Error presenting EVA modal:", error);
    }
  }

  /**
  * Logs out the user by removing stored user data and navigating to the login page.
  * 
  * @returns {Promise<void>} A promise that resolves when the user is logged out.
  */
  async logout(): Promise<void> {
    try {
      await this.storageSrvc.remove('RECORD_ID');
      this.router.navigateByUrl('login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
}
