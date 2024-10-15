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
      await this.getEnabledStatus(this.id); // Make sure this returns a promise if using awStait
  
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  getQuestControlInfo(id: string): Observable<any>{
    var record: string = id;
    var forms: string = 'control_cuestionarios';

    return this.dataSrvc.export(record, forms);
  }

  getQuestsQuestions(quest: string): Observable<any> {
    const path = '../../../assets/data/'+quest+'.json'
    return this.http.get(path);
  }

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

  async checkNotificationsStatus() {
    try {
        const today = new Date();
        const questDates = await this.storageSrvc.get('QUEST_DATES');
        
        const { previousDate } = this.getPreviousAndNextDate(questDates);
        const index = Object.values(questDates).findIndex(date => date === previousDate) + 1;
        // const index = previousDate ? Object.values(questDates).findIndex(date => date === previousDate) : -1;

        if (index !== -1) {
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
              
              console.log("Notification IDs to be cancelled: ", cancelIds);
              await this.notifSrvc.cancelNotifications(cancelIds);
            }
        }
    } catch (error) {
        console.error("Error in checkNotificationsStatus:", error);
    }
  }

  getEnabledStatus(id: string){

    return new Observable<{ enabledQuests: string[], nextDate: string | null }>(observer => {
      let enabledQuests: string[];

      const { previousDate, nextDate } = this.getPreviousAndNextDate(this.questDates);
      this.nextDate = nextDate;

      const index = Object.values(this.questDates).findIndex(date => date === previousDate) +1;

      if (index !== -1) {
        this.getQuestControlInfo(id).subscribe(data => {
          
          this.isEnabledFacseg = data[0]['control_facseg___' + index] === '0' ? '1' : '0';
          this.isEnabledBarthelseg = data[0]['control_barthelseg___' + index] === '0' ? '1' : '0';
          this.isEnabledMonitoring = data[0]['control_seguimiento___' + index] === '0' ? '1' : '0';
          this.isEnabledNeuroQol = data[0]['control_neuroqol___' + index] === '0' ? '1' : '0';

          enabledQuests = [this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol];
  
          this.numEnabledQuests = this.calculatenumEnabledQuests()
          console.log("**", this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol, " - Calculate Enabled Quest Number: ", this.numEnabledQuests)
          this.questFilled.emit();

          observer.next({ enabledQuests, nextDate });
          observer.complete();
  
        });
      } else {
        this.isEnabledFacseg = '0';
        this.isEnabledBarthelseg = '0';
        this.isEnabledMonitoring = '0';
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
  
  calculatenumEnabledQuests(): number {
    const totalEnabled = parseInt(this.isEnabledMonitoring) + 
      parseInt(this.isEnabledBarthelseg) + 
      parseInt(this.isEnabledFacseg) + 
      parseInt(this.isEnabledNeuroQol);

    return totalEnabled
  }

  private getPreviousAndNextDate(questDates: { [key: number]: string }): { previousDate: string | null, nextDate: string | null } {
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

  getNumEnabledQuests(): number {
    return this.numEnabledQuests;
  }
  
}

