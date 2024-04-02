import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
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
  neuro_qol_questions;
  neuro_qol_form: NeuroQoLForm = {}

  constructor(
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private toastCntrl: ToastController,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) { }

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  dismissModal(): void {
    var i = Object.keys(this.neuro_qol_form).length;
    console.log("preguntas contestadas:", i)

    if(i == 0){
      this.modalCntrl.dismiss().then().catch();
    } else {
      this.presentCloseAlert().then(data => {});
    }		
  }

  async presentEmptyFieldsAlert() {
    const alert = await this.alertCntrl.create({
      cssClass: 'my-custom-class',
      header: 'Campos incompletos',
      // message: 'Introducir nivel de dolor',
      mode:'ios',
      buttons: ['Vale']
    });
    await alert.present();
  }

  async presentCloseAlert() {
    const alert = await this.alertCntrl.create({
      cssClass: 'my-custom-class',
      header: 'Cerrar el cuestionario',
      message: 'Si sale se perderán todos los datos. ¿Desea salir de todas formas?',
      mode:'ios',
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

  async presentConfirmationToast() {
    const toast = await this.toastCntrl.create({
      message: 'Sus respuestas se han registrado correctamente.',
      duration: 2000,
      mode: 'ios',
      color: "success"
    });
    toast.present();
  }

}
