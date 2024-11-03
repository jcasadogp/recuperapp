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

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.questsSrvc.getQuestsQuestions('monitoring_data').subscribe(data => {
        this.monitoring_questions = data
  
        this.monitoring_questions = this.monitoring_questions.filter(quest => quest.category == "medical");
        this.monitoring_questions = this.monitoring_questions.filter(quest => quest.redcap_value != "f_seguimiento");
      });
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

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

      const loading = await this.loadingCntrl.create({
        spinner: 'crescent'
      });

      try {
        await loading.present();
        await this.questsSrvc.postMonitoringForm(this.id, this.monitoring_form);
        await this.modalCntrl.dismiss();
        this.presentConfirmationToast();
      } catch (err) {
        console.log(err);
      } finally {
        await loading.dismiss();
      }
    }
  }

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

  dismissModal(): void {
    var i = Object.keys(this.monitoring_form).length;
    
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
