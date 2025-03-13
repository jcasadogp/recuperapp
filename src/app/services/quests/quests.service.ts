import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

import { DataService } from '../data/data.service';

import { MonitoringForm } from 'src/app/interfaces/monitoring-form';
import { FacsegForm } from 'src/app/interfaces/facseg-form';
import { BarthelsegForm } from 'src/app/interfaces/barthelseg-form';
import { NeuroQoLForm } from 'src/app/interfaces/neuro_qol-form';
import { MonitoringData } from 'src/app/redcap_interfaces/monitoring_data';
import { Facseg } from 'src/app/redcap_interfaces/facseg';
import { Barthelseg } from 'src/app/redcap_interfaces/barthelseg';
import { NeuroQol } from 'src/app/redcap_interfaces/neuro_qol';

import { StorageService } from '../storage/storage.service';
import { LocalNotifService } from '../local-notif/local-notif.service';
import { PendingResult } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  private readonly SURGERY_DATE_KEY = 'SURGERY_DATE';
  private readonly QUEST_DATES_KEY = 'QUEST_DATES';

  id: string
  questDates;

  num_instance: number;

  isEnabledMonitoring: string;
  isEnabledBarthelseg: string;
  isEnabledFacseg: string;
  isEnabledNeuroQol: string;

  nextDate;

  private numEnabledQuests: number;

  questFilled: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private http: HttpClient,
    private dataSrvc: DataService,
    private storageSrvc: StorageService,
    private storage: Storage,
    private notifSrvc: LocalNotifService
  ) { 
    this.nextDate = null;
    this.initializeData();
    this.questFilled.emit();
  }

  /**
   * Initializes the necessary data for the component.
   * 
   * This function retrieves the record ID and questionnaire dates from storage, 
   * fetches questionnaire control information, and determines which questionnaires are enabled.
   * 
   * - Retrieves `id` using `getRecordID()`.
   * - Loads `questDates` from storage.
   * - Fetches questionnaire control info and updates tracking variables (`num_facseg`, `num_barthelseg`, etc.).
   * - Calls `getEnabledStatus()` to determine which questionnaires are currently enabled.
   * 
   * @private
   * @returns {Promise<void>} A promise that resolves once all data has been initialized.
   */
  private async initializeData() {
    try {
      this.id = await this.getRecordID();
      console.log(this.id)
      this.questDates = await this.storage.get(this.QUEST_DATES_KEY);
  
      // Get enabled status
      await this.getEnabledStatus(this.id);

      this.num_instance = await this.getQuestInstance();
  
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  /**
   * Asynchronously retrieves the record ID from storage.
   * 
   * @returns {Promise<any>} A promise that resolves with the stored record ID.
   */
  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  /**
   * Retrieves questionnaire control information for a given record ID.
   * 
   * @param {string} id - The record ID for which the questionnaire control information is requested.
   * @returns {Observable<any>} An observable that emits the requested data.
   */
  getQuestControlInfo(id: string): Observable<any> {
    var record: string = id;
    var forms: string = 'control_cuestionarios';

    return this.dataSrvc.export(record, forms);
  }

  /**
   * Retrieves questionnaire questions from a local JSON file.
   * 
   * @param {string} quest - The name of the questionnaire file (without extension).
   * @returns {Observable<any>} An observable that emits the contents of the JSON file.
   */
  getQuestsQuestions(quest: string): Observable<any> {
    const path = '../../../assets/data/' + quest + '.json';
    return this.http.get(path);
  }

  /**
   * Submits a monitoring form for a specific record ID.
   * 
   * This function constructs a monitoring data object and submits it to the data service.
   * It processes both simple fields and multi-select fields, ensuring the correct format.
   * After submission, it updates the monitoring control and checks notification status.
   * 
   * @param {string} id - The record ID to associate with the monitoring form.
   * @param {MonitoringForm} monitoring_form - The monitoring form data to be submitted.
   * @returns {Promise<void>} A promise that resolves when the form submission is complete.
   * @throws Will throw an error if the data submission fails.
   */
  async postMonitoringForm(id: string, monitoring_form: MonitoringForm): Promise<void>{

    var data: MonitoringData[] = [];

    const elem: MonitoringData = {
      record_id: id,
      redcap_repeat_instrument: "datos_seguimiento",
      redcap_repeat_instance: this.num_instance,
      datos_seguimiento_complete: 2
    };
    
    data.push(elem);
    
    // Allocate MONITORING DATA data into data array
    for (var key in monitoring_form) {
      if (!Array.isArray(monitoring_form[key])) {
        data[0][key] = monitoring_form[key];
      } else {
        monitoring_form[key].forEach(value => {
          data[0][`${key}___${value}`] = 1;
        });

        var emptyFields = Array.from(Array(7).keys()).filter(num => !monitoring_form[key].includes(num))

        emptyFields.forEach(value => {
          data[0][`${key}___${value}`] = 0;
        });
      }
    }

    try {
      await lastValueFrom(this.dataSrvc.import(data));

      var data_monitoring = [{ record_id: id }];
      data_monitoring[0]['control_seguimiento___' + (this.num_instance)] = '1';
  
      await lastValueFrom(this.dataSrvc.import(data_monitoring));
      await this.checkNotificationsStatus();
      await this.getEnabledStatus(this.id)

    } catch (err) {
      throw err;
    }
  }
  
  /**
   * Submits a Barthel Index form for a specific record ID.
   * 
   * This function constructs a Barthel Index data object and submits it to the data service.
   * It processes the form data, updates the tracking information, and ensures the monitoring
   * control is updated accordingly. After submission, it checks notification status and updates
   * the enabled status.
   * 
   * @param {string} id - The record ID to associate with the Barthel Index form.
   * @param {BarthelsegForm} barthelseg_form - The Barthel Index form data to be submitted.
   * @returns {Promise<void>} A promise that resolves when the form submission is complete.
   * @throws Will throw an error if the data submission fails.
   */
  async postBarthelsegForm(id: string, barthelseg_form: BarthelsegForm): Promise<void>{

    var data: Barthelseg[] = [];

    const elem: Barthelseg = {
      record_id: id,
      redcap_repeat_instrument: "barthelseg",
      redcap_repeat_instance: this.num_instance,
      barthelseg_complete: 2
    };
    
    data.push(elem);
    
    // Allocate BARTHEL DATA data into data array
    for (var key in barthelseg_form) {
      data[0][key] = barthelseg_form[key];
    }

    try {
      await lastValueFrom(this.dataSrvc.import(data));

      var data_barthelseg = [{ record_id: id }];
      data_barthelseg[0]['control_barthelseg___' + (this.num_instance)] = '1';
  
      await lastValueFrom(this.dataSrvc.import(data_barthelseg));
      await this.checkNotificationsStatus();
      await this.getEnabledStatus(this.id)

    } catch (err) {
      throw err;
    }
  }
  
  /**
   * Submits a FACSEG form for a specific record ID.
   * 
   * This function constructs a FACSEG data object and submits it to the data service.
   * It processes the form data, updates the tracking information, and ensures the monitoring
   * control is updated accordingly. After submission, it checks notification status and updates
   * the enabled status.
   * 
   * @param {string} id - The record ID to associate with the FACSEG form.
   * @param {FacsegForm} facseg_form - The FACSEG form data to be submitted.
   * @returns {Promise<void>} A promise that resolves when the form submission is complete.
   * @throws Will throw an error if the data submission fails.
   */
  async postFacsegForm(id: string, facseg_form: FacsegForm): Promise<void>{

    var data: Facseg[] = [];

    const elem: Facseg = {
      record_id: id,
      redcap_repeat_instrument: "facseg",
      redcap_repeat_instance: this.num_instance,
      facseg_complete: 2
    };
    
    data.push(elem);

    // Allocate FACSEG DATA data into data array
    data[0].f_facseg = facseg_form.f_facseg;
    data[0].fac_seguimiento = facseg_form.fac_seguimiento;

    try {
      await lastValueFrom(this.dataSrvc.import(data));

      var data_facseg = [{ record_id: id }];
      data_facseg[0]['control_facseg___' + (this.num_instance)] = '1';
  
      await lastValueFrom(this.dataSrvc.import(data_facseg));
      await this.checkNotificationsStatus();
      await this.getEnabledStatus(this.id)

    } catch (err) {
      throw err;
    }
  }

  /**
   * Submits a Neuro-QoL form for a specific record ID.
   * 
   * This function constructs a Neuro-QoL data object and submits it to the data service.
   * It processes the form data, updates the tracking information, and ensures the monitoring
   * control is updated accordingly. After submission, it checks notification status and updates
   * the enabled status.
   * 
   * @param {string} id - The record ID to associate with the Neuro-QoL form.
   * @param {NeuroQoLForm} neuroqol_form - The Neuro-QoL form data to be submitted.
   * @returns {Promise<void>} A promise that resolves when the form submission is complete.
   * @throws Will throw an error if the data submission fails.
   */
  async postNeuroQolForm(id: string, neuroqol_form: NeuroQoLForm): Promise<void>{

    var data: NeuroQol[] = [];

    const elem: NeuroQol = {
      record_id: id,
      redcap_repeat_instrument: "neuroqol",
      redcap_repeat_instance: this.num_instance,
      neuroqol_complete: 2
    };
    
    data.push(elem);
    
    // Allocate NEUROQOL DATA data into data array
    for (var key in neuroqol_form) {
      data[0][key] = neuroqol_form[key];
    }

    try {
      await lastValueFrom(this.dataSrvc.import(data));

      var data_neuroqol = [{ record_id: id }];
      data_neuroqol[0]['control_neuroqol___' + (this.num_instance)] = '1';
  
      await lastValueFrom(this.dataSrvc.import(data_neuroqol));
      await this.checkNotificationsStatus();
      await this.getEnabledStatus(this.id)

    } catch (err) {
      throw err;
    }
  }

  /**
   * Determines the current questionnaire instance based on the stored questionnaire dates and the current date.
   * 
   * This function compares the current date with the stored questionnaire dates and determines which instance 
   * the participant is currently in. The instances are based on months after surgery, and the function returns 
   * the index of the current instance.
   * 
   * @returns {Promise<number | null>} A promise that resolves with the current instance number (index of the date) 
   *          or `null` if no suitable instance is found.
   * 
   * @throws Will log a `null` instance if no matching date is found.
   */
  async getQuestInstance() {
    const questDates = this.questDates;
    const currentDate = new Date();
    let instance: number = 0;
  
    if (questDates) {
      const dateKeys = Object.keys(questDates).map(key => parseInt(key));
      dateKeys.sort((a, b) => a - b);
      
      for (let i = 1; i < dateKeys.length; i++) {
        const currentKey = dateKeys[i - 1];
        const nextKey = dateKeys[i];
  
        const currentQuestDate = new Date(questDates[currentKey]);

        console.log(currentQuestDate, currentKey, nextKey)
  
        if (currentDate >= currentQuestDate && (!nextKey || currentDate < new Date(questDates[nextKey]))) {
          instance = i;
          break;
        }
      }
    }
  
    console.log("Quest instance:", instance);
    return instance;
  }

  /**
   * Checks the status of pending notifications and cancels them if all required forms 
   * for the previous date have been completed.
   * 
   * This function retrieves stored questionnaire dates, determines the previous date,
   * and checks whether all necessary control forms (FACSEG, Barthel, Seguimiento, NeuroQoL) 
   * have been completed for that date. If all forms are completed, it cancels any pending 
   * notifications related to that date.
   * 
   * @returns {Promise<void>} A promise that resolves when the notification status check is complete.
   * @throws Logs an error if any step in the process fails.
   */
  async checkNotificationsStatus() {
    try {
      const index = this.num_instance
      console.log(index)
      
      // If index was 0, no quest would be yet available for the first time so no notification could be yet canceled
      if (index !== 0) {
        console.log(this.id)
        const controlData = await firstValueFrom(this.getQuestControlInfo(this.id));
        console.log(controlData)
        
        const allControlsEnabled = 
          controlData[0]['control_facseg___' + index] === "1" &&
          controlData[0]['control_barthelseg___' + index] === "1" &&
          controlData[0]['control_seguimiento___' + index] === "1" &&
          controlData[0]['control_neuroqol___' + index] === "1";
          
        if (allControlsEnabled) {
          const pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
          const pendingNotifs = pendingNotifications.notifications;

          console.log("*** Got pending notifications", pendingNotifs)

          const questFrecuencies = [1, 3, 4, 6, 9, 12];
          const f = questFrecuencies[index - 1];

          const cancelIds = pendingNotifs
            .filter(notif => Math.floor(notif.id / 10) === f)
            .map(notif => notif.id);

          console.log("*** Filtered pending notifications", cancelIds)
          
          if(cancelIds.length > 0){
            await this.notifSrvc.cancelNotifications(cancelIds);
          }
        }
      }
    } catch (error) {
      console.error("Error in checkNotificationsStatus:", error);
    }
  }

  /**
   * Retrieves the enabled status of different questionnaires for a given record ID.
   * 
   * This function determines which questionnaires (Monitoring, Barthel, FACSEG, NeuroQoL)
   * are enabled based on the completion status from the control data. It also calculates 
   * the next available date for questionnaire submission.
   * 
   * @param {string} id - The record ID for which the enabled status should be retrieved.
   * @returns {Observable<{ enabledQuests: string[], nextDate: string | null }>} 
   *          An observable that emits an object containing:
   *          - `enabledQuests`: An array indicating which questionnaires are enabled (values: '1' for enabled, '0' for disabled).
   *          - `nextDate`: The next scheduled date for questionnaires or `null` if none.
   * @throws Emits an error if no questionnaire dates are available.
   */
  getEnabledStatus(id: string){

    return new Observable<{ enabledQuests: string[], nextDate: string | null }>(observer => {
      
      let enabledQuests: string[];

      // Check if this.questDates is null or undefined
      if (!this.questDates || Object.values(this.questDates).length === 0) {
        console.error("this.questDates is null or undefined");
        observer.error("No quest dates available.");
        return;
      }

      const { nextDate } = this.getNextDate(this.questDates);
      this.nextDate = nextDate;

      const index = this.num_instance

      if (index !== 0) {
        
        this.getQuestControlInfo(id).subscribe(data => {
          
          this.isEnabledMonitoring = data[0]['control_seguimiento___' + index] === '0' ? '1' : '0';
          this.isEnabledBarthelseg = data[0]['control_barthelseg___' + index] === '0' ? '1' : '0';
          this.isEnabledFacseg = data[0]['control_facseg___' + index] === '0' ? '1' : '0';
          this.isEnabledNeuroQol = data[0]['control_neuroqol___' + index] === '0' ? '1' : '0';

          enabledQuests = [this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol];
  
          this.numEnabledQuests = parseInt(this.isEnabledMonitoring) + parseInt(this.isEnabledBarthelseg) + parseInt(this.isEnabledFacseg) + parseInt(this.isEnabledNeuroQol);
          console.log("**", this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol, " - Calculate Enabled Quest Number: ", this.numEnabledQuests)
          this.questFilled.emit();

          observer.next({ enabledQuests, nextDate });
          observer.complete();
  
        });
      } else {
        
        this.isEnabledMonitoring = '0';
        this.isEnabledBarthelseg = '0';
        this.isEnabledFacseg = '0';
        this.isEnabledNeuroQol = '0';

        enabledQuests = [this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol];
  
        this.numEnabledQuests = parseInt(this.isEnabledMonitoring) + parseInt(this.isEnabledBarthelseg) + parseInt(this.isEnabledFacseg) + parseInt(this.isEnabledNeuroQol);
        console.log("**", this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol, " - Calculate Enabled Quest Number: ", this.numEnabledQuests)
        this.questFilled.emit();

        observer.next({ enabledQuests, nextDate });
        observer.complete();
      }
    })
  }
  
  /**
   * Determines the most recent past date and the next upcoming date (nextDate) 
   * from a given set of questionnaire dates.
   *  
   * This function processes an object containing date values, identifies the most recent 
   * past date, and finds the next closest future date.
   * 
   * @param { { [key: number]: string } | null } questDates - An object mapping numeric keys to date strings.
   * @returns { { nextDate: string | null } } 
   *      An object containing:
   *        - `nextDate`: The next closest future date in `YYYY-MM-DD` format, or `null` if none exist.
   */
    private getNextDate(questDates: { [key: number]: string } | null): { nextDate: string | null } {

      // Check if questDates is null or empty
      if (!questDates || Object.keys(questDates).length === 0) {
        return { nextDate: null };
      }
      
      const today = new Date();
      const dates = Object.values(questDates).map(dateStr => new Date(dateStr));
  
      // Filter for previous dates
      const previousDates = dates.filter(date => date < today);
      previousDates.sort((a, b) => b.getTime() - a.getTime());
      const previousDate = previousDates.length > 0 ? previousDates[0].toISOString().split('T')[0] : null;
  
      // Find next dates after the previous date
      const nextDates = dates.filter(date => date > (previousDate ? new Date(previousDate) : today));
      nextDates.sort((a, b) => a.getTime() - b.getTime());
      const nextDate = nextDates.length > 0 ? nextDates[0].toISOString().split('T')[0] : null;
  
      return { nextDate };
    }

  /**
   * Retrieves the total number of enabled questionnaires.
   * 
   * This function returns the previously calculated number of enabled questionnaires, 
   * which is stored in the `numEnabledQuests` property.
   * 
   * @returns {number} The total count of enabled questionnaires.
   */
  getNumEnabledQuests(): number {
    return this.numEnabledQuests;
  }

  /**
   * Retrieves the stored questionnaire dates from local storage.
   * 
   * This function fetches the stored dates that indicate when questionnaires 
   * should be completed based on the participant's surgery date.
   * 
   * @returns {Promise<{ [key: number]: string } | null>} A promise that resolves 
   *          with an object mapping months to corresponding questionnaire dates, 
   *          or `null` if no data is found.
   */
  async getQuestDates(): Promise<{ [key: number]: string } | null> {
    return await this.storage.get(this.QUEST_DATES_KEY);
  }

  /**
   * Retrieves the stored surgery date from local storage.
   * 
   * This function fetches the date of surgery that was previously stored 
   * in local storage for the participant.
   * 
   * @returns {Promise<string | null>} A promise that resolves with the stored 
   *          surgery date as a string (in ISO format) or `null` if no date is found.
   */
  async getSurgeryDate(): Promise<string | null> {
    return await this.storage.get(this.SURGERY_DATE_KEY);
  }

}

