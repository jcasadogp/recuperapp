import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceId } from '@capacitor/device';
import { Storage } from '@ionic/storage-angular';

// Services
import { DataService } from '../data/data.service';
import { ParticipantService } from '../participant/participant.service';

// Redcap Interfaces
import { Devices } from 'src/app/redcap_interfaces/devices';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  num_devices;

  private readonly SURGERY_DATE_KEY = 'SURGERY_DATE';
  private readonly QUEST_DATES_KEY = 'QUEST_DATES';

  

  constructor(
    private dataSrvc: DataService,
    private storage: Storage,
    private participantSrvc: ParticipantService
  ) { }

  /**
   * Fetches user data based on the provided user ID.
   * 
   * This function retrieves user information from the 'login' form stored in the data service. 
   * It exports the data associated with the given user ID.
   * 
   * @param {string} id - The unique identifier of the user.
   * @returns {Observable<any>} An observable that emits the user data.
   */
  getUser(id: string): Observable<any>{
    var record: string = id;
    var forms: string = 'login';

    return this.dataSrvc.export(record, forms);
  }

  /**
   * Retrieves a list of device IDs associated with a given user ID.
   * 
   * This function fetches device data from the 'dispositivos' form stored in the data service.
   * It extracts the device IDs from the response and updates the total count of devices.
   * 
   * @param {string} id - The unique identifier of the user.
   * @returns {Observable<string[]>} An observable that emits an array of device IDs.
   */
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

  /**
   * Adds a new device entry for a given user in the 'dispositivos' form.
   *
   * This function creates a new device record with a unique repeat instance, 
   * assigns the provided `device_id`, and submits the data to the data service.
   *
   * @param {string} id - The unique identifier of the user.
   * @param {string} device_id - The unique identifier of the device to be added.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
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

  /**
   * Calculates and stores questionnaire dates based on a participant's surgery date and given frequencies.
   * 
   * This function retrieves the baseline data for a participant to get the surgery date, then 
   * calculates future questionnaire dates based on the provided frequencies. The calculated dates 
   * are then stored in local storage.
   * 
   * @param {string} participantId - The unique identifier of the participant.
   * @param {number[]} questFrequencies - An array of numbers representing the months after surgery when questionnaires should be completed.
   * 
   * @returns {Promise<void>} A promise that resolves once the dates are calculated and stored.
   * 
   * @throws Will log an error if retrieving baseline data or storing dates fails.
   */
  async calculateAndStoreQuestDates(participantId: string, questFrequencies: number[]): Promise<void> {
    try {
      const data = await firstValueFrom(this.participantSrvc.getBaselineData(participantId));
      
      const surgeryDate = data[0].f_cirug_a;
      console.log("   => Surgery date to storage =>", this.SURGERY_DATE_KEY, surgeryDate)
      await this.storage.set(this.SURGERY_DATE_KEY, surgeryDate);
      
      let questDates = {};
      
      for (let f of questFrequencies) {
        let date = new Date(surgeryDate);
        date.setMonth(date.getMonth() + f);
        // questDates[f] = date.toISOString().split('T')[0];
        questDates[f] = date.toLocaleDateString('en-CA');
      }
      
      console.log("   => Quest dates to storage =>", this.QUEST_DATES_KEY, questDates)
      await this.storage.set(this.QUEST_DATES_KEY, questDates);
    
    } catch (error) {
      console.error('Error calculating quest dates:', error);
    }
  }

  
}
