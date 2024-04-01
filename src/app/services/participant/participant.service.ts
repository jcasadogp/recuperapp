import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '../data/data.service';
import { Participant, BaselineData } from 'src/app/redcap_interfaces/participant';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  id: number;

  constructor(
    private dataSrvc: DataService,
    private http: HttpClient,
    private storageSrvc: StorageService
  ) {
    this.getRecordID();
   }

  async getRecordID(): Promise<any> {
    try {
      const result =  await this.storageSrvc.get('RECORD_ID');
      this.id = result
      console.log(this.id);
    }
    catch(e) { console.log(e) }
  }

  getParticipant(): Observable<Participant> {
    
    var record: number = this.id;
    var forms: string = "participantes";

    return this.dataSrvc.export(record, forms);
  }

  getBaselineData(): Observable<BaselineData>{
    
    var record: number = this.id;
    var forms: string = "datos_basales";

    return this.dataSrvc.export(record, forms);
  }

  getBasiLineDataJson(): Observable<any> {
    return this.http.get('../../../assets/data/baseline_data.json');
  }
}
