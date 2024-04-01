import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private dataSrvc: DataService
  ) {

  }

  getUser(id: number): Observable<any>{
    var record: number = id;
    var forms: string = 'login';

    return this.dataSrvc.export(record, forms);
  }

  // getNumEva(id: number): Observable<any> {
  //   var record: number = id;
  //   var forms: string = 'autentificacion';
  //   var fields: string[] = ['num_eva'];

  //   return this.dataSrvc.export(record, forms);
  // }

  // getNumMed(id: number): Observable<any> {
  //   var record: number = id;
  //   var forms: string = 'autentificacion';
  //   var fields: string[] = ['num_med'];

  //   return this.dataSrvc.export(record, forms);
  // }

  // getNumBpi(id: number): Observable<any> {
  //   var record: number = id;
  //   var forms: string = 'autentificacion';
  //   var fields: string[] = ['num_bpi'];

  //   return this.dataSrvc.export(record, forms);
  // }

  // getNumQlq(id: number): Observable<any> {
  //   var record: number = id;
  //   var forms: string = 'autentificacion';
  //   var fields: string[] = ['num_qlq'];

  //   return this.dataSrvc.export(record, forms);
  // }

  // getNumSymptoms(id: number): Observable<any> {
  //   var record: number = id;
  //   var forms: string = 'autentificacion';
  //   var fields: string[] = ['num_sintomas'];

  //   return this.dataSrvc.export(record, forms);
  // }

  // getNumRegister(id: number): Observable<any> {
  //   var record: number = id;
  //   var forms: string = 'autentificacion';
  //   var fields: string[] = ['num_registros'];

  //   return this.dataSrvc.export(record, forms);
  // }
}
