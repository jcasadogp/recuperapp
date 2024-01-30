import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '../data/data.service';
import { Participant } from 'src/app/redcap_interfaces/participant';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  constructor(
    private dataSrvc: DataService
  ) { }

  getParticipant(id: number): Observable<Participant> {
    
    var record: number = id;
    var forms: string = "participantes";
    // var fields: string[] = [""];

    // return this.dataSrvc.export(record, forms, fields);
    return this.dataSrvc.export(record, forms);
  }
}
