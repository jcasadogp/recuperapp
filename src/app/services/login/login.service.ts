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

  getUser(id: string): Observable<any>{
    var record: string = id;
    var forms: string = 'login';

    console.log("getUser()", id, "login")

    return this.dataSrvc.export(record, forms);
  }
}
