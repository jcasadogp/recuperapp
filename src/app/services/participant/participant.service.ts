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

  constructor(
    private dataSrvc: DataService,
    private http: HttpClient
  ) { }

  getParticipant(id: string): Observable<Participant[]> {
    
    var record: string = id;
    var forms: string = "participantes";

    return this.dataSrvc.export(record, forms);
  }

  getBaselineData(id: string): Observable<BaselineData>{
    
    var record: string = id;
    var forms: string = "datos_basales";

    return this.dataSrvc.export(record, forms);
  }

  getBasiLineDataJson(): Observable<any> {
    return this.http.get('../../../assets/data/baseline_data.json');
  }
}
