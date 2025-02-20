import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Devices } from 'src/app/redcap_interfaces/devices';
import { DeviceId } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  num_devices;

  constructor(
    private dataSrvc: DataService
  ) { }

  getUser(id: string): Observable<any>{
    var record: string = id;
    var forms: string = 'login';

    return this.dataSrvc.export(record, forms);
  }

  getDevices(id: string): Observable<any> {
    var record: string = id;
    var forms: string = 'dispositivos';
  
    return this.dataSrvc.export(record, forms).pipe(
      map((devices: any[]) => {
        const deviceIds = devices.map(device => device.device_id);
        const deviceCount = deviceIds.length;
        this.num_devices = deviceCount;
        
        return deviceIds;
      })
    );
  }

  async addDevice(id: string, device_id: string): Promise<void> {

    var data: Devices[] = [];

    const elem: Devices = {
      record_id: id,
      redcap_repeat_instrument: "dispositivos",
      redcap_repeat_instance: this.num_devices+1,
      dispositivos_complete: 2
    };

    data.push(elem);
    data[0].device_id = device_id;

    console.log(data)

    this.dataSrvc.import(data).subscribe((res) => { })
  }
}
