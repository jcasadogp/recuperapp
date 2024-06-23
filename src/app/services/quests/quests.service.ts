import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '../data/data.service';
import { QuestControl } from 'src/app/redcap_interfaces/quest_control';

import { MonitoringForm } from 'src/app/interfaces/monitoring-form';
import { FacsegForm } from 'src/app/interfaces/facseg-form';
import { Facseg } from 'src/app/redcap_interfaces/facseg';
import { BarthelsegForm } from 'src/app/interfaces/barthelseg-form';
import { Barthelseg } from 'src/app/redcap_interfaces/barthelseg';

import { StorageService } from '../storage/storage.service';
import { LoginService } from '../login/login.service';
import { MonitoringData } from 'src/app/redcap_interfaces/monitoring_data';
import { NeuroQoLForm } from 'src/app/interfaces/neuro_qol-form';
import { NeuroQol } from 'src/app/redcap_interfaces/neuro_qol';

import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  id: string
  public currentDate: Date;
  questFrecuencies: number[];

  num_facseg: number;
  num_barthelseg: number;
  num_seguimiento: number;
  num_neuroqol: number;

  firstMonitoring;
  firstBarthelseg;
  firstFacseg;
  firstNeuroQol;

  nextMonitoringDate;
  nextBarthelsegDate;
  nextFacsegDate;
  nextNeuroQolDate;

  isEnabledMonitoring: string;
  isEnabledBarthelseg: string;
  isEnabledFacseg: string;
  isEnabledNeuroQol: string;

  private numEnabledQuests: number;

  questFilled: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private http: HttpClient,
    private dataSrvc: DataService,
    private loginSrvc: LoginService,
    private storageSrvc: StorageService
  ) {
    this.currentDate = new Date()
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]

    this.nextMonitoringDate = null;
    this.nextBarthelsegDate = null;
    this.nextFacsegDate = null;
    this.nextNeuroQolDate = null;

    this.getRecordID().then(id => {
      this.loginSrvc.getUser(id).subscribe(data => {
        this.num_facseg = data[0].num_facseg === "" ? 0 : +data[0].num_facseg;
        this.num_barthelseg = data[0].num_barthelseg === "" ? 0 : +data[0].num_barthelseg;
        this.num_seguimiento = data[0].num_seguimiento === "" ? 0 : +data[0].num_seguimiento;
        this.num_neuroqol = data[0].num_neuroqol === "" ? 0 : +data[0].num_neuroqol;
      })

      this.getEnabledStatus(id)
    })

    this.questFilled.emit();
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
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
  
      this.num_seguimiento++;
      await lastValueFrom(this.dataSrvc.import(data_monitoring));
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
  
      this.num_barthelseg++;
      await lastValueFrom(this.dataSrvc.import(data_barthelseg));
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
  
      this.num_facseg++;
      await lastValueFrom(this.dataSrvc.import(data_facseg));
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
  
      this.num_neuroqol++;
      await lastValueFrom(this.dataSrvc.import(data_neuroqol));
    } catch (err) {
      throw err;
    }
  }

  getQuestStatus(id: string): Observable<QuestControl> {
    
    var record: string = id;
    var forms: string = "control_cuestionarios";

    return this.dataSrvc.export(record, forms)
  }

  getEnabledStatus(id: string): Observable<{ enabledQuests: string[], nextDates: string[] }> {
    
    return new Observable<{ enabledQuests: string[], nextDates: string[] }>(observer => {
      this.getQuestStatus(id).subscribe({
        next: (data: QuestControl) => {

          let enabledQuests: string[];
          let nextDates: string[];
          
          if(data[0].quest_control == 0){ // Automático
            if (data[0].monitoring_date_1 && data[0].monitoring_date_1 !== "") {
              this.checkQuestDate('Monitoring', data[0].monitoring_date_1);
            } else {
              this.isEnabledMonitoring = '1'
            }
            
            if (data[0].barthelseg_date_1 && data[0].barthelseg_date_1 !== "") {
              this.checkQuestDate('Barthelseg', data[0].barthelseg_date_1);
            } else {
              this.isEnabledBarthelseg = '1'
            }
            
            if (data[0].facseg_date_1 && data[0].facseg_date_1 !== "") {
              this.checkQuestDate('Facseg', data[0].facseg_date_1);
            } else {
              this.isEnabledFacseg = '1'
            }
            
            if (data[0].neuroqol_date_1 && data[0].neuroqol_date_1 !== "") {
              this.checkQuestDate('NeuroQol', data[0].neuroqol_date_1);
            } else {
              this.isEnabledNeuroQol = '1'
            }
            
            enabledQuests = [this.isEnabledMonitoring, this.isEnabledBarthelseg, 
              this.isEnabledFacseg, this.isEnabledNeuroQol];

            nextDates = [this.nextMonitoringDate, this.nextBarthelsegDate, 
              this.nextFacsegDate, this.nextNeuroQolDate];
              
            this.numEnabledQuests = this.calculatenumEnabledQuests()

            console.log("**", this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol)
            console.log("** Calculate Enabled Quest Number: ", this.numEnabledQuests)
            this.questFilled.emit();
          
          } else { //Manual
            this.isEnabledMonitoring = "1"
            this.isEnabledBarthelseg = "1"
            this.isEnabledFacseg = "1"
            this.isEnabledNeuroQol = "1"

            enabledQuests = [this.isEnabledMonitoring, this.isEnabledBarthelseg, 
              this.isEnabledFacseg, this.isEnabledNeuroQol];

            nextDates = [this.nextMonitoringDate, this.nextBarthelsegDate, 
              this.nextFacsegDate, this.nextNeuroQolDate];
              
            this.numEnabledQuests = this.calculatenumEnabledQuests()

            console.log("**", this.isEnabledMonitoring, this.isEnabledBarthelseg, this.isEnabledFacseg, this.isEnabledNeuroQol)
            console.log("** Calculate Enabled Quest Number: ", this.numEnabledQuests)
            this.questFilled.emit();
          }

          observer.next({ enabledQuests, nextDates });
          observer.complete();
        },
        error: (err) => {
          console.log(err)
        },
        complete: () => {}
      })
    })
  }

  async setQuestStatus(id: string, quest_name: string): Promise<void> {

    this.getQuestStatus(id).subscribe({
      next: (data: QuestControl) => {

        if(data[0].quest_control == 0){
          var data2: QuestControl[] = [];

          const elem: QuestControl = {
            record_id: id,
            control_cuestionarios_complete: 2
          }

          data2.push(elem)
          data2[0] = { ...data[0], ...data2[0] };

          if (data[0][`${quest_name}_date_1`] == ""){
            data2[0][`${quest_name}_date_1`] = new Date().toISOString().split('T')[0]
          }
          
          this.dataSrvc.import(data2).subscribe((res) => {})
          this.getEnabledStatus(id).subscribe((res) => {})
        } 
      },
      error: (err) => {console.log(err)},
      complete: () => {}
    })
  }

  checkQuestDate(prefix, first_data_date) {

    let firstDate = `first${prefix}`;
    let isEnabled = `isEnabled${prefix}`;
    let nextDate = `next${prefix}Date`;

    this[firstDate] = new Date(first_data_date)
    
    for (let f of this.questFrecuencies) {
      let updateDate = new Date(this[firstDate].getTime());
      updateDate.setMonth(updateDate.getMonth() + f);

      this[isEnabled] = this.datesAreEqual(updateDate, this.currentDate) ? "1" : "0";
      this[isEnabled] = (f == this.questFrecuencies[this.questFrecuencies.length -1] && updateDate < this.currentDate) ? "2" : this[isEnabled];
      this[nextDate] = (this[nextDate] == null && updateDate >= this.currentDate) ? updateDate.toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'}) : this[nextDate];
    }
  }

  datesAreEqual(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
  
  calculatenumEnabledQuests(): number {
    const totalEnabled = parseInt(this.isEnabledMonitoring) + 
      parseInt(this.isEnabledBarthelseg) + 
      parseInt(this.isEnabledFacseg) + 
      parseInt(this.isEnabledNeuroQol);

    return totalEnabled
  }

  getNumEnabledQuests(): number {
    return this.numEnabledQuests;
  }
}

