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
}
