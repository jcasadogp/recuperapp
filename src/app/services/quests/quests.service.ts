import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { DataService } from '../data/data.service';
import { QuestControl } from 'src/app/redcap_interfaces/quest_control';

import { MonitoringForm } from 'src/app/interfaces/monitoring-form';
import { FacsegForm } from 'src/app/interfaces/facseg-form';
import { Facseg } from 'src/app/redcap_interfaces/facseg';
import { BarthelsegForm } from 'src/app/interfaces/barthelseg-form';
import { Barthelseg } from 'src/app/redcap_interfaces/barthelseg';

import { StorageService } from '../storage/storage.service';
import { MonitoringData } from 'src/app/redcap_interfaces/monitoring_data';
import { NeuroQoLForm } from 'src/app/interfaces/neuro_qol-form';
import { NeuroQol } from 'src/app/redcap_interfaces/neuro_qol';

import { lastValueFrom } from 'rxjs';
import { LocalNotifService } from '../local-notif/local-notif.service';
import { PendingResult } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  id: string
  public currentDate: Date;
  questFrecuencies: number[];
  questDates;

  num_facseg: number;
  num_barthelseg: number;
  num_seguimiento: number;
  num_neuroqol: number;

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
    private notifSrvc: LocalNotifService
  ) {
    this.currentDate = new Date()
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]

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
      this.questDates = await this.storageSrvc.get('QUEST_DATES');
  
      // Fetch quest control info
      this.getQuestControlInfo(this.id).subscribe(data => {
        this.num_facseg = data[0].num_facseg === "" ? 0 : +data[0].num_facseg;
        this.num_barthelseg = data[0].num_barthelseg === "" ? 0 : +data[0].num_barthelseg;
        this.num_seguimiento = data[0].num_seguimiento === "" ? 0 : +data[0].num_seguimiento;
        this.num_neuroqol = data[0].num_neuroqol === "" ? 0 : +data[0].num_neuroqol;
      });
  
      // Get enabled status
      await this.getEnabledStatus(this.id); // Make sure this returns a promise if using await
  
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
      redcap_repeat_instance: this.num_seguimiento+1,
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
      var data_monitoring = [
        {
          record_id: id,
          num_seguimiento: this.num_seguimiento + 1
        }
      ];

      data_monitoring[0]['control_seguimiento___' + (this.num_seguimiento + 1)] = '1';
  
      this.num_seguimiento++;
      await lastValueFrom(this.dataSrvc.import(data_monitoring));
      await this.checkNotificationsStatus();
    } catch (err) {
      throw err;
    }
  }
  
  /**
   * Submits a Barthel Index form for a specific record ID.
   * 
   * This function constructs a Barthel Index data object and submits it to the data service.
   * It processes the form data, updates the tracking information, and ensures the monitoring
   * control is updated accordingly.
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
      redcap_repeat_instance: this.num_barthelseg+1,
      barthelseg_complete: 2
    };
    
    data.push(elem);
    
    // Allocate BARTHEL DATA data into data array
    for (var key in barthelseg_form) {
      data[0][key] = barthelseg_form[key];
    }

    try {
      await lastValueFrom(this.dataSrvc.import(data));
      var data_barthelseg = [
        {
          record_id: id,
          num_barthelseg: this.num_barthelseg+1
        }
      ];

      data_barthelseg[0]['control_barthelseg___' + (this.num_barthelseg + 1)] = '1';
  
      this.num_barthelseg++;
      await lastValueFrom(this.dataSrvc.import(data_barthelseg));
      await this.checkNotificationsStatus();
    } catch (err) {
      throw err;
    }
  }
  
  /**
   * Submits a FACSEG form for a specific record ID.
   * 
   * This function constructs a FACSEG data object and submits it to the data service.
   * It processes the form data, updates the tracking information, and ensures the monitoring
   * control is updated accordingly.
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
      redcap_repeat_instance: this.num_facseg+1,
      facseg_complete: 2
    };
    
    data.push(elem);

    // Allocate FACSEG DATA data into data array
    data[0].f_facseg = facseg_form.f_facseg;
    data[0].fac_seguimiento = facseg_form.fac_seguimiento;

    try {
      await lastValueFrom(this.dataSrvc.import(data));
      var data_facseg = [
        {
          record_id: id,
          num_facseg: this.num_facseg+1
        }
      ];

      data_facseg[0]['control_facseg___' + (this.num_facseg + 1)] = '1';
  
      this.num_facseg++;
      await lastValueFrom(this.dataSrvc.import(data_facseg));
      await this.checkNotificationsStatus();
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
      redcap_repeat_instance: this.num_neuroqol+1,
      neuroqol_complete: 2
    };
    
    data.push(elem);
    
    // Allocate NEUROQOL DATA data into data array
    for (var key in neuroqol_form) {
      data[0][key] = neuroqol_form[key];
    }

    try {
      await lastValueFrom(this.dataSrvc.import(data));
      var data_neuroqol = [
        {
          record_id: id,
          num_neuroqol: this.num_neuroqol+1
        }
      ];

      data_neuroqol[0]['control_neuroqol___' + (this.num_neuroqol + 1)] = '1';
  
      this.num_neuroqol++;
      await lastValueFrom(this.dataSrvc.import(data_neuroqol));
      await this.checkNotificationsStatus();
      await this.getEnabledStatus(this.id)
    } catch (err) {
      throw err;
    }
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
      const questDates = await this.storageSrvc.get('QUEST_DATES');
      
      const { previousDate } = this.getPreviousAndNextDate(questDates);
      const index = Object.values(questDates).findIndex(date => date === previousDate) + 1;
      
      if (index !== 0) {
          const controlData = await firstValueFrom(this.getQuestControlInfo(this.id));

          const allControlsEnabled = 
              controlData[0]['control_facseg___' + index] === "1" &&
              controlData[0]['control_barthelseg___' + index] === "1" &&
              controlData[0]['control_seguimiento___' + index] === "1" &&
              controlData[0]['control_neuroqol___' + index] === "1";

          if (allControlsEnabled) {

            const pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
            const pendingNotifs = pendingNotifications.notifications;
            const cancelIds = pendingNotifs
              .filter(notif => notif.id.toString().startsWith(index.toString()))
              .map(notif => notif.id);
            
            await this.notifSrvc.cancelNotifications(cancelIds);
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

      const { previousDate, nextDate } = this.getPreviousAndNextDate(this.questDates);
      this.nextDate = nextDate;

      // Check if this.questDates is null or undefined
      if (!this.questDates || Object.values(this.questDates).length === 0) {
        console.error("this.questDates is null or undefined");
        observer.error("No quest dates available.");
        return;
      }

      const index = Object.values(this.questDates).findIndex(date => date === previousDate) +1;

      if (index !== 0) {
        this.getQuestControlInfo(id).subscribe(data => {
          
          this.isEnabledMonitoring = data[0]['control_seguimiento___' + index] === '0' ? '1' : '0';
          this.isEnabledBarthelseg = data[0]['control_barthelseg___' + index] === '0' ? '1' : '0';
          this.isEnabledFacseg = data[0]['control_facseg___' + index] === '0' ? '1' : '0';
          this.isEnabledNeuroQol = data[0]['control_neuroqol___' + index] === '0' ? '1' : '0';

          enabledQuests = [this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol];
  
          this.numEnabledQuests = this.calculatenumEnabledQuests()
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
  
        this.numEnabledQuests = this.calculatenumEnabledQuests()
        console.log("**", this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol, " - Calculate Enabled Quest Number: ", this.numEnabledQuests)
        this.questFilled.emit();

        observer.next({ enabledQuests, nextDate });
        observer.complete();
      }
    })
  }
  
  /**
   * Calculates the total number of enabled questionnaires.
   * 
   * This function converts the enabled status of each questionnaire 
   * (Monitoring, Barthel, FACSEG, NeuroQoL) from string to integer ('1' for enabled, '0' for disabled)
   * and sums them to determine the total number of enabled questionnaires.
   * 
   * @returns {number} The total count of enabled questionnaires.
   */
  calculatenumEnabledQuests(): number {
    const totalEnabled = parseInt(this.isEnabledMonitoring) + 
      parseInt(this.isEnabledBarthelseg) + 
      parseInt(this.isEnabledFacseg) + 
      parseInt(this.isEnabledNeuroQol);

    return totalEnabled
  }

  /**
   * Determines the most recent past date (previousDate) and the next upcoming date (nextDate) 
   * from a given set of questionnaire dates.
   * 
   * This function processes an object containing date values, identifies the most recent 
   * past date, and finds the next closest future date.
   * 
   * @param { { [key: number]: string } | null } questDates - An object mapping numeric keys to date strings.
   * @returns { { previousDate: string | null, nextDate: string | null } } 
   *          An object containing:
   *          - `previousDate`: The most recent past date in `YYYY-MM-DD` format, or `null` if none exist.
   *          - `nextDate`: The next closest future date in `YYYY-MM-DD` format, or `null` if none exist.
   */
  private getPreviousAndNextDate(questDates: { [key: number]: string } | null): { previousDate: string | null, nextDate: string | null } {

    // Check if questDates is null or empty
    if (!questDates || Object.keys(questDates).length === 0) {
      return { previousDate: null, nextDate: null };
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

    return { previousDate, nextDate };
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
  
}

