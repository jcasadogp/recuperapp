import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { EvaForm } from 'src/app/interfaces/eva-form';
import { EvaService } from 'src/app/services/eva/eva.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-eva',
  templateUrl: './eva.component.html',
  styleUrls: ['./eva.component.scss'],
})
export class EvaComponent  implements OnInit {

  id: string;
  public currentDate_string: string;
  eva_form: EvaForm;

  constructor(
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private toastCntrl: ToastController,
    private evaSrvc: EvaService,
    private storageSrvc: StorageService
  ) { 
    this.currentDate_string = new Date().toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'})
    this.eva_form = {}
  }

  /**
   * Initializes the component by retrieving the record ID and setting a default value for `eva_form.eva`.
   * 
   * - Calls `getRecordID()` to fetch the record ID asynchronously.
   * - Assigns the retrieved ID to `this.id`.
   * - Initializes `eva_form.eva` with a default value of `0`.
   */
  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.eva_form.eva = 0;
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
   * Submits the EVA form after validating the required fields.
   * 
   * - Ensures that `eva_form.eva` is a number or `eva_form.fecha_eva` is not null.
   * - Sets `eva_form.fecha_eva` to the current date in ISO format.
   * - Calls `postEvaForm()` service method to submit the form data.
   * - On successful submission, dismisses the modal and shows a confirmation toast.
   * - Displays an alert if required fields are missing.
   */
  postEvaForm(): void {

    if(typeof(this.eva_form.eva) == "number" || this.eva_form.fecha_eva != null){
      
      this.eva_form.fecha_eva = new Date().toISOString().split('T')[0]
      
      this.evaSrvc.postEvaForm(this.id, this.eva_form).then(()=>{

        this.dismissModal();
        this.presentConfirmationToast();
        
      }).catch((err) => console.log(err));

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
		this.modalCntrl.dismiss().then().catch();
  }

  /**
   * Displays an alert when required fields are missing in the form.
   * 
   * - Creates an alert dialog using `alertCntrl.create()`.
   * - Sets the header to "Campos incompletos".
   * - Provides a message instructing the user to enter the pain level.
   * - Includes a single confirmation button labeled "Vale".
   * - Presents the alert to the user.
   */
  async presentEmptyFieldsAlert() {
    const alert = await this.alertCntrl.create({
      header: 'Campos incompletos',
      message: 'Introducir nivel de dolor',
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
            this.dismissModal();
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