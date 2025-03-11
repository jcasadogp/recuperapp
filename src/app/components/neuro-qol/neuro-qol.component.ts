import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { NeuroQoLForm } from 'src/app/interfaces/neuro_qol-form';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-neuro-qol',
  templateUrl: './neuro-qol.component.html',
  styleUrls: ['./neuro-qol.component.scss'],
})
export class NeuroQolComponent  implements OnInit {

  id: string;
  neuroqol_questions;
  neuroqol_form: NeuroQoLForm = {}

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
   * - Fetches the list of 'barthelseg' questions.
   * - Filters out questions that are not categorized as "medical" or have specific `redcap_value` exclusions.
   */
  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.questsSrvc.getQuestsQuestions('neuroqol').subscribe(data => {
        this.neuroqol_questions = data
  
        // Filter questions based on category and exclusions
        this.neuroqol_questions = this.neuroqol_questions.filter(quest => 
          quest.category === "medical" && 
          quest.redcap_value !== "f_neuroqol"
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
   * Submits the NeuroQoL form if all required fields are filled.
   * 
   * - Ensures the form contains at least 20 fields before submission.
   * - Displays a loading spinner during submission.
   * - Posts the form using `questsSrvc.postNeuroQolForm`.
   * - Closes the modal and shows a confirmation toast on success.
   * - Handles errors gracefully.
   */
  async postNeuroQolForm(): Promise<void> {

    this.neuroqol_form.f_neuroqol = new Date().toISOString().split('T')[0]

    var i = Object.keys(this.neuroqol_form).length;

    if(i < 20){
      this.presentEmptyFieldsAlert;
    } else {
      const loading = await this.loadingCntrl.create({ spinner: 'crescent' });

      try {
        await loading.present();
        await this.questsSrvc.postNeuroQolForm(this.id, this.neuroqol_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log("Error submitting NeuroQoL form:", err);
      } finally {
        await loading.dismiss();
      }
    }
  }

  /**
  * Handles modal dismissal.
  * 
  * - If the form is empty, dismisses the modal immediately.
  * - If the form contains data, prompts the user with a confirmation alert before closing.
  */
  dismissModal(): void {
    var i = Object.keys(this.neuroqol_form).length;
    
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
