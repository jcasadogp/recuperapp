import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '../data/data.service';
import { QuestControl } from 'src/app/redcap_interfaces/quest_control';

import { MonitoringForm } from 'src/app/interfaces/monitoring-form';
import { MonitoringData } from 'src/app/redcap_interfaces/monitoring_data';
import { FacsegForm } from 'src/app/interfaces/facseg-form';
import { Facseg } from 'src/app/redcap_interfaces/facseg';
import { BarthelsegForm } from 'src/app/interfaces/barthelseg-form';
import { Barthelseg } from 'src/app/redcap_interfaces/barthelseg';

import { StorageService } from '../storage/storage.service';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  num_facseg: number;
  num_barthelseg: number;
  num_seguimiento: number;
  num_neuro_qol: number;

  monitoring_data: MonitoringData;

  constructor(
    private http: HttpClient,
    private dataSrvc: DataService,
    private loginSrvc: LoginService,
    private storageSrvc: StorageService
  ) {
    this.getRecordID().then(id => {
      this.loginSrvc.getUser(id).subscribe(data => {
        this.num_facseg = data[0].num_facseg === "" ? 0 : +data[0].num_facseg;
        this.num_barthelseg = data[0].num_barthelseg === "" ? 0 : +data[0].num_barthelseg;
        this.num_seguimiento = data[0].num_seguimiento === "" ? 0 : +data[0].num_seguimiento;
        this.num_neuro_qol = data[0].num_neuro_qol === "" ? 0 : +data[0].num_neuro_qol;
      })
    })
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

    console.log(data)

    this.dataSrvc.import(data).subscribe((res) => {

      var data_monitoring = [
        {
          record_id: id,
          num_seguimiento: this.num_seguimiento+1
        }
      ];

      this.num_seguimiento++;
      this.dataSrvc.import(data_monitoring).subscribe((res) => {})
    })
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
    
    for (var key in barthelseg_form) {
      data[0][key] = barthelseg_form[key];
    }

    console.log(data)
    
    this.dataSrvc.import(data).subscribe((res) => {

      var data_barthelseg = [
        {
          record_id: id,
          num_barthelseg: this.num_barthelseg+1
        }
      ];

      this.num_barthelseg++;
      
      this.dataSrvc.import(data_barthelseg).subscribe((res) => {})
    })
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
    data[0].f_facseg = facseg_form.f_facseg;
    data[0].fac_seguimiento = facseg_form.fac_seguimiento;

    // console.log(data)
    
    this.dataSrvc.import(data).subscribe((res) => {

      var data_facseg = [
        {
          record_id: id,
          num_facseg: this.num_facseg+1
        }
      ];

      this.num_facseg++;
      
      this.dataSrvc.import(data_facseg).subscribe((res) => {})
    })
  }

  getQuestStatus(id: string): Observable<QuestControl> {
    
    var record: string = id;
    var forms: string = "control_cuestionarios";

    console.log("getQuestStatus()", id, "control_cuestionarios")

    return this.dataSrvc.export(record, forms);
  }

  async setQuestStatus(id: string, quest_name: string): Promise<void> {
    this.getQuestStatus(id).subscribe({
      next: (data: QuestControl) => {

        var data2: QuestControl[] = [];

        const elem: QuestControl = {
          record_id: id,
          control_cuestionarios_complete: 2
        }

        data2.push(elem)

        data2[0] = { ...data[0], ...data2[0] };

        if(quest_name == "barthelseg"){
          data2[0].barthelseg_enabled = '0'
        } else if(quest_name == "monitoring"){
          data2[0].monitoring_enabled = '0'
        } else if(quest_name == "facseg") {
          data2[0].facseg_enabled = '0'
        }
        

        this.dataSrvc.import(data2).subscribe((res) => {
          console.log("Quest Status Updated")
        })

      },
      error: (err) => {console.log(err)},
      complete: () => {}
    })
  }
}

