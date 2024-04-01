import { Injectable } from '@angular/core';

import { DataService } from '../data/data.service';
import { EvaForm } from 'src/app/interfaces/eva-form';
import { Eva } from 'src/app/redcap_interfaces/eva';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class EvaService {

  id: number;
  num_eva: number;

  constructor(
    private dataSrvc: DataService,
    private storageSrvc: StorageService
  ) { 
    // this.id = 118
    this.getRecordID();
    this.num_eva = 0
  }

  async getRecordID(): Promise<any> {
    try {
      const result =  await this.storageSrvc.get('RECORD_ID');
      this.id = result
      console.log(this.id);
    }
    catch(e) { console.log(e) }
  }

  async postEvaForm(eva_form: EvaForm): Promise<void>{

    var data: Eva[] = [];

    const elem: Eva = {
      record_id: this.id,
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
          record_id: this.id,
          num_eva: this.num_eva+1
        }
      ];

      this.num_eva++;
      
      this.dataSrvc.import(data_eva).subscribe((res) => {
      })

    })
  }

  getEvaData(id: number): Observable<Eva[]> {
    
    var record: number = id;
    var forms: string = "eva";

    return this.dataSrvc.export(record, forms);
  }
}
