import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FacsegForm } from 'src/app/interfaces/facseg-form';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-facseg',
  templateUrl: './facseg.component.html',
  styleUrls: ['./facseg.component.scss'],
})
export class FacsegComponent  implements OnInit {

  id: string;
  facseg_questions;
  facseg_form: FacsegForm = {}

  constructor(
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private toastCntrl: ToastController,
    private loadingCntrl: LoadingController,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) { }

  /**
   * Lifecycle hook that initializes component data.
   * 
   * - Retrieves the user's record ID from storage.
   * - Fetches the list of 'facseg' questions.
   * - Filters out questions that are not categorized as "medical" or have specific `redcap_value` exclusions.
   */
  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.questsSrvc.getQuestsQuestions('facseg').subscribe(data => {
        this.facseg_questions = data

        // Filter questions based on category and exclusions
        this.facseg_questions = this.facseg_questions.filter(quest => 
          quest.category === "medical" && 
          quest.redcap_value !== "f_facseg"
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
   * Submits the Facseg form if all required fields are filled.
   * 
   * - Displays a loading spinner during submission.
   * - Posts the form using `questsSrvc.postFacsegForm`.
   * - Closes the modal and shows a confirmation toast on success.
   * - Handles errors gracefully.
   */
  async postFacsegForm(): Promise<void> {

    if(typeof(this.facseg_form.fac_seguimiento) == "number" || this.facseg_form.fac_seguimiento != null){
      
      this.facseg_form.f_facseg = new Date().toISOString().split('T')[0]

      const loading = await this.loadingCntrl.create({ spinner: 'crescent' });
      
      try {
        await loading.present();
        await this.questsSrvc.postFacsegForm(this.id, this.facseg_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log("Error submitting Facseg form:", err);
      } finally {
        await loading.dismiss();
      }

    } else {
      this.presentEmptyFieldsAlert();
    }
  }

  /**
  * Handles modal dismissal.
  * 
  * - If the form is empty, dismisses the modal immediately.
  * - If the form contains data, prompts the user with a confirmation alert before closing.
  */
  dismissModal(): void {
    var i = Object.keys(this.facseg_form).length;
    
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
