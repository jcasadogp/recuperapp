import { Injectable } from '@angular/core';

import { DataService } from '../data/data.service';
import { EvaForm } from 'src/app/interfaces/eva-form';
import { Eva } from 'src/app/redcap_interfaces/eva';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { QuestsService } from '../quests/quests.service';


@Injectable({
  providedIn: 'root'
})
export class EvaService {

  num_eva: number;

  constructor(
    private dataSrvc: DataService,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) {
    this.getRecordID().then(id => {
      this.questsSrvc.getQuestControlInfo(id).subscribe(data => {
        this.num_eva = data[0].num_eva === "" ? 0 : +data[0].num_eva;
      })
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  async postEvaForm(id: string, eva_form: EvaForm): Promise<void>{

    var data: Eva[] = [];

    const elem: Eva = {
      record_id: id,
      redcap_repeat_instrument: "eva",
      redcap_repeat_instance: this.num_eva+1,
      eva_complete: 2
    };
    
    data.push(elem);
    data[0].fecha_eva = eva_form.fecha_eva;
    data[0].eva = eva_form.eva;
    
    this.dataSrvc.import(data).subscribe((res) => {

      var data_eva = [
        {
          record_id: id,
          num_eva: this.num_eva+1
        }
      ];

      this.num_eva++;
      
      this.dataSrvc.import(data_eva).subscribe((res) => {
      })

    })
  }

  getEvaData(id: string): Observable<Eva[]> {
    
    var record: string = id;
    var forms: string = "eva";

    return this.dataSrvc.export(record, forms);
  }

  getNumEvaQuests(): number {
    return this.num_eva;
  }
}
