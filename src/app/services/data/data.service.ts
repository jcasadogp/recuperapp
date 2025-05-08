import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';

import { BODYIMPORT } from 'src/app/shared/body-import';
import { BODYEXPORT } from 'src/app/shared/body-export';

@Injectable({
    providedIn: 'root'
})
export class DataService {

  url: string = 'https://bioinfo.irycis.org/redcap/api/';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  }

  constructor(
    private http: HttpClient
  ) { }
  

  // ===============================================================================================
  // EXPORT DATA DE REDCAP A LA APLICACIÓN
  // ===============================================================================================
  /**
   * Exports data from REDCap for a given record and form.
   * 
   * @param {string} record - The specific record ID to export.
   * @param {string} forms - The form name(s) to export data from.
   * @returns {Observable<any>} - The response from the REDCap API.
   */
  export(record: string, forms: string){
    var body_export = new URLSearchParams(BODYEXPORT);
    body_export.set("records", record);
    body_export.set("forms", forms);
    
    var res = this.http.post<any>(this.url, body_export.toString(), this.httpOptions);
    return res;
  }
  
  // ===============================================================================================
  // IMPORT DATA DE LA APLICACIÓN A REDCAP
  // ===============================================================================================
  /**
   * Imports data from the application into REDCap.
   * 
   * @param {any} data - The data to be imported in JSON format.
   * @returns {Observable<any>} - The response from the REDCap API.
   */
  import(data: any){
    var body_import = new URLSearchParams(BODYIMPORT);
    body_import.set("data", JSON.stringify(data));

    var res = this.http.post<any>(this.url, body_import.toString(), this.httpOptions);
    return res;
  }
}