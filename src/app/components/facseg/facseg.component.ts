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

      const loading = await this.loadingCntrl.create({
        spinner: 'crescent'
      });
      
      try {
        await loading.present();
        await this.questsSrvc.postFacsegForm(this.id, this.facseg_form);
        await loading.present();
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log(err);
      } finally {
        await loading.dismiss();
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
      header: 'Campos incompletos',
      buttons: ['Vale']
    });
    await alert.present();
  }

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

  async presentConfirmationToast() {
    const toast = await this.toastCntrl.create({
      message: 'Sus respuestas se han registrado correctamente.',
      duration: 2000,
      color: "success"
    });
    toast.present();
  }

}
