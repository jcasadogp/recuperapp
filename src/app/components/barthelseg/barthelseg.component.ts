import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { BarthelsegForm } from 'src/app/interfaces/barthelseg-form';
import { QuestsService } from 'src/app/services/quests/quests.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-barthelseg',
  templateUrl: './barthelseg.component.html',
  styleUrls: ['./barthelseg.component.scss'],
})
export class BarthelsegComponent  implements OnInit {

  id: string;
  barthelseg_questions;
  barthelseg_form: BarthelsegForm = {}

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
        this.id = data;
        this.questsSrvc.getQuestsQuestions('barthelseg').subscribe(data => {
            this.barthelseg_questions = data;

            // Filter questions based on category and exclusions
            this.barthelseg_questions = this.barthelseg_questions.filter(quest => 
                quest.category === "medical" && 
                quest.redcap_value !== "f_barthel" && 
                quest.redcap_value !== "barthel_score_s"
            );
        });
    });
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
   * Submits the Barthelseg form if all required fields are filled.
   * 
   * - Ensures the form contains at least 11 fields before submission.
   * - Displays a loading spinner during submission.
   * - Posts the form using `questsSrvc.postBarthelsegForm`.
   * - Closes the modal and shows a confirmation toast on success.
   * - Handles errors gracefully.
   */
  async postBarthelsegForm(): Promise<void> {
    this.barthelseg_form.f_barthel = new Date().toISOString().split('T')[0]; // Set current date

    var fieldCount = Object.keys(this.barthelseg_form).length;

    if (fieldCount < 11) {
      this.presentEmptyFieldsAlert(); // Alert user if fields are missing
    } else {
      const loading = await this.loadingCntrl.create({ spinner: 'crescent' });
      
      try {
        await loading.present();
        await this.questsSrvc.postBarthelsegForm(this.id, this.barthelseg_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log("Error submitting Barthelseg form:", err);
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
    var fieldCount = Object.keys(this.barthelseg_form).length;

    if (fieldCount === 0) {
        this.modalCntrl.dismiss().then().catch();
    } else {
        this.presentCloseAlert().then().catch();
    }        
  }

  /**
  * Displays an alert when required fields are missing in the form.
  */
  async presentEmptyFieldsAlert() {
    const alert = await this.alertCntrl.create({
        header: 'Campos incompletos',
        message: 'Por favor complete todos los campos antes de enviar.',
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
        message: 'Si sale, se perderán todos los datos. ¿Desea salir de todas formas?',
        buttons: [
            {
                text: 'Permanecer',
                role: 'cancel',
                cssClass: 'secondary',
            },
            {
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
