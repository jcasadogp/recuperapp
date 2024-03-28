import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';

import { BODYIMPORT } from 'src/app/shared/body-import';
import { BODYEXPORT } from 'src/app/shared/body-export';

@Injectable({
    providedIn: 'root'
})
export class DataService {

  url: string = 'https://bioinfo.irycis.org/redcap/api/';
  body_export;
  body_import;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  }

  constructor(
    private http: HttpClient
  ) {
    this.body_export = BODYEXPORT;
    this.body_import = BODYIMPORT;
  }
  

  // ===============================================================================================
  // EXPORT DATA DE REDCAP A LA APLICACIÓN
  // ===============================================================================================
  export(record: number, forms: string){
    this.body_export.append("records", JSON.stringify(record));
    this.body_export.append("forms", forms);
    // this.body_export.append("fields", JSON.stringify(fields));
          
    var res = this.http.post<any>(this.url, this.body_export.toString(), this.httpOptions);
    return res;
  }
  
  // ===============================================================================================
  // IMPORT DATA DE LA APLICACIÓN A REDCAP
  // ===============================================================================================
  import(data: any){
    this.body_import.append('data', JSON.stringify(data));
    var res = this.http.post<any>(this.url, this.body_import.toString(), this.httpOptions);
    return res;
  }

}