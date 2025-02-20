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

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.questsSrvc.getQuestsQuestions('barthelseg').subscribe(data => {
        this.barthelseg_questions = data
  
        this.barthelseg_questions = this.barthelseg_questions.filter(quest => quest.category == "medical");
        this.barthelseg_questions = this.barthelseg_questions.filter(quest => quest.redcap_value != "f_barthel");
        this.barthelseg_questions = this.barthelseg_questions.filter(quest => quest.redcap_value != "barthel_score_s");
      });
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  async postBarthelsegForm(): Promise<void> {

    this.barthelseg_form.f_barthel = new Date().toISOString().split('T')[0]

    var i = Object.keys(this.barthelseg_form).length;

    if(i < 11){
      this.presentEmptyFieldsAlert;
    } else {

      const loading = await this.loadingCntrl.create({
        spinner: 'crescent'
      });

      try {
        await loading.present();
        await this.questsSrvc.postBarthelsegForm(this.id, this.barthelseg_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log(err);
      } finally {
        await loading.dismiss();
      }
    }
  }

  dismissModal(): void {
    var i = Object.keys(this.barthelseg_form).length;
    
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
