import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FacsegForm } from 'src/app/interfaces/facseg-form';
import { Facseg } from 'src/app/redcap_interfaces/facseg';
import { DataService } from '../data/data.service';
import { BarthelsegForm } from 'src/app/interfaces/barthelseg-form';
import { Barthelseg } from 'src/app/redcap_interfaces/barthelseg';

@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  id: number;
  num_facseg: number;
  num_barthelseg: number;

  constructor(
    private http: HttpClient,
    private dataSrvc: DataService
  ) {
    this.id = 118
    this.num_facseg = 0
    this.num_barthelseg = 0
   }

  getQuestsQuestions(quest: string): Observable<any> {
    const path = '../../../assets/data/'+quest+'.json'
    return this.http.get(path);
  }

  async postBarthelsegForm(barthelseg_form: BarthelsegForm): Promise<void>{

    var data: Barthelseg[] = [];

    const elem: Barthelseg = {
      record_id: this.id,
      redcap_repeat_instrument: "barthelseg",
      redcap_repeat_instance: this.num_facseg+1,
      barthelseg_complete: 2
    };
    
    data.push(elem);
    
    // Allocate BARTHELSEG data into data array

    console.log(data)
    
    this.dataSrvc.import(data).subscribe((res) => {

      var data_eva = [
        {
          record_id: this.id,
          num_facseg: this.num_barthelseg+1
        }
      ];

      this.num_barthelseg++;
      
      this.dataSrvc.import(data_eva).subscribe((res) => {
      })

    })
  }
  
  async postFacsegForm(facseg_form: FacsegForm): Promise<void>{

    var data: Facseg[] = [];

    const elem: Facseg = {
      record_id: this.id,
      redcap_repeat_instrument: "facseg",
      redcap_repeat_instance: this.num_facseg+1,
      facseg_complete: 2
    };
    
    data.push(elem);
    data[0].f_facseg = facseg_form.f_facseg;
    data[0].fac_seguimiento = facseg_form.fac_seguimiento;

    console.log(data)
    
    this.dataSrvc.import(data).subscribe((res) => {

      var data_eva = [
        {
          record_id: this.id,
          num_facseg: this.num_facseg+1
        }
      ];

      this.num_facseg++;
      
      this.dataSrvc.import(data_eva).subscribe((res) => {
      })

    })
  }
}

