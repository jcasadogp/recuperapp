import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
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
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) { }

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.questsSrvc.getQuestsQuestions('facseg').subscribe(data => {
        this.facseg_questions = data
  
        this.facseg_questions = this.facseg_questions.filter(quest => quest.category == "medical");
        this.facseg_questions = this.facseg_questions.filter(quest => quest.redcap_value != "f_facseg");
      });
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  async postFacsegForm(): Promise<void> {

    if(typeof(this.facseg_form.fac_seguimiento) == "number" || this.facseg_form.fac_seguimiento != null){
      
      this.facseg_form.f_facseg = new Date().toISOString().split('T')[0]
      
      try {
        await this.questsSrvc.postFacsegForm(this.id, this.facseg_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log(err);
      }

    } else {
      this.presentEmptyFieldsAlert();
    }
  }

  dismissModal(): void {
    var i = Object.keys(this.facseg_form).length;
    
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
