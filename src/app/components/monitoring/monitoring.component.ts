import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { MonitoringForm } from 'src/app/interfaces/monitoring-form';
import { QuestsService } from 'src/app/services/quests/quests.service';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent  implements OnInit {

  monitoring_questions;
  monitoring_form: MonitoringForm = {}

  constructor(
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private toastCntrl: ToastController,
    private questsSrvc: QuestsService
  ) { }

  ngOnInit() {
    this.questsSrvc.getQuestsQuestions('monitoring_data').subscribe(data => {
      this.monitoring_questions = data

      this.monitoring_questions = this.monitoring_questions.filter(quest => quest.category == "medical");
      this.monitoring_questions = this.monitoring_questions.filter(quest => quest.redcap_value != "f_seguimiento");
    });
  }

  postMonitoringForm(): void {

    this.monitoring_form.f_seguimiento = new Date().toISOString().split('T')[0]
    console.log(this.monitoring_form)

    var i = Object.keys(this.monitoring_form).length;
    console.log("preguntas contestadas:", i)

    if(i < 11){
      var camposVacios = 11 - i;
      this.presentEmptyFieldsAlert;
    } else {

      this.questsSrvc.postBarthelsegForm(this.monitoring_form).then(()=>{

        // this.questSrvc.blockQuest(2);
        this.dismissModal();
        this.presentConfirmationToast();
        
      }).catch((err) => console.log(err));
    }
  }

  dismissModal(): void {
    var i = Object.keys(this.monitoring_form).length;
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
