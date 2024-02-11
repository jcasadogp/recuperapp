import { Injectable } from '@angular/core';

import { DataService } from '../data/data.service';
import { Eva } from 'src/app/interfaces/eva';


@Injectable({
  providedIn: 'root'
})
export class EvaService {

  id: number;
  num_eva: number;

  constructor(
    private dataSrvc: DataService
  ) { 
    this.id = 118
    this.num_eva = 0
  }

  // Import de la entrada de eva
  async postEvaForm(eva_form: Eva): Promise<void>{

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
}
