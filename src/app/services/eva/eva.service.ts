import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Services
import { DataService } from '../data/data.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { QuestsService } from 'src/app/services/quests/quests.service';

// Redcap Interfaces
import { Eva } from 'src/app/redcap_interfaces/eva';

// Interfaces
import { EvaForm } from 'src/app/interfaces/eva-form';


@Injectable({
  providedIn: 'root'
})
export class EvaService {

  num_eva: number;

  constructor(
    private dataSrvc: DataService,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) {
    this.getRecordID().then(id => {
      this.questsSrvc.getQuestControlInfo(id).subscribe(data => {
        this.num_eva = data[0].num_eva === "" ? 0 : +data[0].num_eva;
      })
    })
  }

  /**
   * Retrieves the stored record ID from the storage service.
   * 
   * @returns {Promise<any>} - The stored RECORD_ID.
   */
  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  /**
   * Submits an EVA form for a specific record.
   * 
   * @param {string} id - The record ID to associate with the EVA form.
   * @param {EvaForm} eva_form - The EVA form data to be submitted.
   * @returns {Promise<void>} - Resolves once the data has been successfully imported.
   */
  async postEvaForm(id: string, eva_form: EvaForm): Promise<void> {
    var data: Eva[] = [];

    // Construct EVA data entry
    const elem: Eva = {
      record_id: id,
      redcap_repeat_instrument: "eva",
      redcap_repeat_instance: this.num_eva + 1,
      eva_complete: 2
    };

    data.push(elem);
    data[0].fecha_eva = eva_form.fecha_eva;
    data[0].eva = eva_form.eva;

    // Import EVA data to the REDCap system
    this.dataSrvc.import(data).subscribe((res) => {
      var data_eva = [
        {
          record_id: id,
          num_eva: this.num_eva + 1
        }
      ];

      // Increment EVA instance count
      this.num_eva++;

      // Update the count in REDCap
      this.dataSrvc.import(data_eva).subscribe((res) => {});
    });
  }

  /**
   * Fetches EVA data for a given record ID.
   * 
   * @param {string} id - The record ID for which EVA data is requested.
   * @returns {Observable<Eva[]>} - Observable containing the retrieved EVA data.
   */
  getEvaData(id: string): Observable<Eva[]> {
    var record: string = id;
    var forms: string = "eva";

    return this.dataSrvc.export(record, forms);
  }

  /**
   * Retrieves the number of EVA questionnaires completed.
   * 
   * @returns {number} - The current count of EVA forms completed.
   */
  getNumEvaQuests(): number {
    return this.num_eva;
  }
}
