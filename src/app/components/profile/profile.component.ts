import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BaselineData } from 'src/app/redcap_interfaces/participant';
import { ParticipantService } from 'src/app/services/participant/participant.service';
import { StorageService } from 'src/app/services/storage/storage.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent  implements OnInit {

  id: string;

  public finalResultArray;

  public baselineData_structure;

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
    private participantSrvc: ParticipantService,
    private storageSrvc: StorageService
  ) { }

  /**
   * Initializes component data on component load.
   * 
   * - Retrieves the record ID from storage.
   * - Fetches the baseline data structure from the participant service.
   * - Calls `getBaselineData()` to load additional baseline details.
   */
  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.participantSrvc.getBasiLineDataJson().subscribe(data => {
        this.baselineData_structure = data
      });
      this.getBaselineData()
    })
  }

  /**
   * Retrieves the stored record ID from the storage service.
   * 
   * @returns {Promise<any>} A promise that resolves to the stored record ID.
   */
  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  /**
   * Fetches and processes the baseline data for the participant.
   * Filters relevant questions and maps responses to a structured format.
   */
  getBaselineData(){
    this.participantSrvc.getBaselineData(this.id).subscribe({
      next: (data: BaselineData) => {
        
        this.baselineData_structure = this.baselineData_structure.filter(
          quest => quest.category === "datos_personales" || quest.category === "antecedentes_clinicos"
        );

        data[0] = Object.entries(data[0]).reduce((acc, [key, value]) => {
          if (value !== "" && !(key.includes('___') && value === "0")) {
            acc[key] = value;
          }
          return acc;
        }, {});

        let resultArray: { Pregunta: string, Respuesta: string }[] = [];

        Object.keys(data[0]).forEach(key => {
          let value = data[0][key];

          this.baselineData_structure.forEach(q => {
            
            if (key === q.redcap_value) {
              if (q.field_type === "radio") {
                let answerObj = q.answers.find(answer => answer.redcap_value.toString() == value);
                if (answerObj) {
                  resultArray.push({ Pregunta: q.question, Respuesta: answerObj.answer });
                }
              } else {
                resultArray.push({ Pregunta: q.question, Respuesta: value });
              }
            } else if(key.startsWith(q.redcap_value) && q.field_type === "checkbox") {
              q.answers.forEach(a => {
                let combinedKey = q.redcap_value + "___" + a.redcap_value;
                if (combinedKey == key && a.answer != "Otros") {
                  resultArray.push({ Pregunta: q.question, Respuesta: a.answer })
                } else if (combinedKey == key && a.answer == "Otros") {
                  resultArray.push({ Pregunta: q.question, Respuesta: data[0]["otros"] })
                }
              });
            }
          });
        });

        let groupedResult = resultArray.reduce((acc, { Pregunta, Respuesta }) => {
          if (!acc[Pregunta]) { acc[Pregunta] = [] }
          acc[Pregunta].push(Respuesta);
          return acc;
        }, {});

        this.finalResultArray = Object.entries(groupedResult).map(([Pregunta, Respuesta]) => ({ Pregunta, Respuesta }));

      },
      error: (err) => console.log(err),
      complete: () => {}
    })
  }
  
  /**
  * Handles modal dismissal.
  * 
  * - If the form is empty, dismisses the modal immediately.
  * - If the form contains data, prompts the user with a confirmation alert before closing.
  */
  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }
}
