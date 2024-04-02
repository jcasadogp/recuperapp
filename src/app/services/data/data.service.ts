import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';

import { BODYIMPORT } from 'src/app/shared/body-import';
import { BODYEXPORT } from 'src/app/shared/body-export';

@Injectable({
    providedIn: 'root'
})
export class DataService {

  url: string = 'https://bioinfo.irycis.org/redcap/api/';
  // body_export;
  // body_import;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  }

  constructor(
    private http: HttpClient
  ) {
    // this.body_export = BODYEXPORT;
    // this.body_import = BODYIMPORT;
  }
  

  // ===============================================================================================
  // EXPORT DATA DE REDCAP A LA APLICACIÓN
  // ===============================================================================================
  export(record: string, forms: string){
    var body_export = BODYEXPORT;
    // body_export.append("records", JSON.stringify(record));
    body_export.append("records", record);
    body_export.append("forms", forms);
    
    console.log("**", record, typeof(record))
    console.log("**", body_export.toString())
    
    var res = this.http.post<any>(this.url, body_export.toString(), this.httpOptions);
    return res;
  }
  
  // ===============================================================================================
  // IMPORT DATA DE LA APLICACIÓN A REDCAP
  // ===============================================================================================
  import(data: any){
    var body_import = BODYIMPORT;
    body_import.append('data', JSON.stringify(data));
    var res = this.http.post<any>(this.url, body_import.toString(), this.httpOptions);
    return res;
  }

}