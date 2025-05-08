import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { MonitoringForm } from 'src/app/interfaces/monitoring-form';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent  implements OnInit {

  id: string;
  monitoring_questions;
  monitoring_form: MonitoringForm = {}
  public currentDate_string: string;

  constructor(
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private toastCntrl: ToastController,
    private loadingCntrl: LoadingController,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) {
    this.currentDate_string = new Date().toISOString();
    this.monitoring_form.f_exitus_seguimiento = this.currentDate_string
   }
   
  /**
   * Lifecycle hook that initializes component data.
   * 
   * - Retrieves the user's record ID from storage.
   * - Fetches the list of 'monitoring' questions.
   * - Filters out questions that are not categorized as "medical" or have specific `redcap_value` exclusions.
   */
  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.questsSrvc.getQuestsQuestions('monitoring_data').subscribe(data => {
        this.monitoring_questions = data
  
        // Filter questions based on category and exclusions
        this.monitoring_questions = this.monitoring_questions.filter(quest => 
          quest.category === "medical" && 
          quest.redcap_value !== "f_seguimiento"
          );
      });
    })
  }

  /**
  * Retrieves the stored record ID of the user.
  *
  * @returns {Promise<any>} A promise that resolves with the user's record ID.
  */
  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  /**
   * Submits the Monitoring form if all required fields are filled.
   * 
   * - Ensures the form contains at least 9/10 fields before submission.
   * - Displays a loading spinner during submission.
   * - Posts the form using `questsSrvc.postMonitoringForm`.
   * - Closes the modal and shows a confirmation toast on success.
   * - Handles errors gracefully.
   */
  async postMonitoringForm(): Promise<void> {
    
    const transformDateToYMD = (dateString: string): string => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let num;

    if (this.monitoring_form.f_exitus_seguimiento) {
      this.monitoring_form.f_exitus_seguimiento = transformDateToYMD(this.monitoring_form.f_exitus_seguimiento);
      console.log(this.monitoring_form.f_exitus_seguimiento);
      num = 10
    } else {
      console.log("f_exitus_seguimiento is undefined");
      num = 9
    }
    
    var i = Object.keys(this.monitoring_form).length;

    if (i < num) {
      this.presentEmptyFieldsAlert();
    } else {
      const loading = await this.loadingCntrl.create({ spinner: 'crescent' });

      try {
        await loading.present();
        await this.questsSrvc.postMonitoringForm(this.id, this.monitoring_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log("Error submitting Monitoring form:", err);
      } finally {
        await loading.dismiss();
      }
    }
  }

  /**
   * Updates the selected values of a checkbox group in the `monitoring_form` object.
   * 
   * - If the checkbox is checked, the corresponding `redcap_value` array is updated to include the selected value.
   * - If unchecked, the selected value is removed from the array.
   * - Ensures that `monitoring_form[redcap_value]` is initialized as an array before adding values.
   * 
   * @param event - The event object containing the checkbox state (`event.detail.checked`) and value (`event.detail.value`).
   * @param redcap_value - The key in `monitoring_form` representing the checkbox group.
   */
  updateCheckboxSelectedValues(event: any, redcap_value: string) {
    if (event.detail.checked) {
      if (!this.monitoring_form[redcap_value]) {
        this.monitoring_form[redcap_value] = [];
      }
      this.monitoring_form[redcap_value].push(event.detail.value);
    } else {
      this.monitoring_form[redcap_value] = this.monitoring_form[redcap_value].filter((value: any) => value !== event.detail.value);
    }
  }

  /**
  * Handles modal dismissal.
  * 
  * - If the form is empty, dismisses the modal immediately.
  * - If the form contains data, prompts the user with a confirmation alert before closing.
  */
  dismissModal(): void {
    var i = Object.keys(this.monitoring_form).length;
    
    if(i == 0){
      this.modalCntrl.dismiss().then().catch();
    } else {
      this.presentCloseAlert().then(data => {});
    }		
  }

  /**
  * Displays an alert when required fields are missing in the form.
  */
  async presentEmptyFieldsAlert() {
    const alert = await this.alertCntrl.create({
      header: 'Campos incompletos',
      buttons: ['Vale']
    });
    await alert.present();
  }

  /**
  * Displays an alert asking the user to confirm if they want to exit the form.
  * 
  * - If the user confirms, the modal is dismissed.
  * - If the user cancels, they remain in the form.
  */
  async presentCloseAlert() {
    const alert = await this.alertCntrl.create({
      header: 'Cerrar el cuestionario',
      message: 'Si sale se perderán todos los datos. ¿Desea salir de todas formas?',
      buttons: [
        {
          text: 'Permanecer',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Salir',
          handler: () => {
            this.modalCntrl.dismiss().then().catch();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
  * Displays a toast notification confirming successful form submission.
  */
  async presentConfirmationToast() {
    const toast = await this.toastCntrl.create({
      message: 'Sus respuestas se han registrado correctamente.',
      duration: 2000,
      color: "success"
    });
    toast.present();
  }

}
