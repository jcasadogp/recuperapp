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
  
  /**
   * Retrieves participant information for a given record ID.
   * 
   * @param {string} id - The record ID of the participant.
   * @returns {Observable<Participant[]>} - An observable containing the participant's data.
   */
  getParticipant(id: string): Observable<Participant[]> {
    var record: string = id;
    var forms: string = "participantes";

    return this.dataSrvc.export(record, forms);
  }

  /**
   * Retrieves baseline data for a given record ID.
   * 
   * @param {string} id - The record ID for which baseline data is requested.
   * @returns {Observable<BaselineData>} - An observable containing the baseline data.
   */
  getBaselineData(id: string): Observable<BaselineData> {
    var record: string = id;
    var forms: string = "datos_basales";

    return this.dataSrvc.export(record, forms);
  }

  /**
   * Retrieves baseline data from a local JSON file.
   * 
   * @returns {Observable<any>} - An observable containing the baseline data from a JSON file.
   */
  getBasiLineDataJson(): Observable<any> {
    return this.http.get('../../../assets/data/baseline_data.json');
  }

}
