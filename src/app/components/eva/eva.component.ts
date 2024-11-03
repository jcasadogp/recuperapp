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

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.eva_form.eva = 0;
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

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

  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }

  async presentEmptyFieldsAlert() {
    const alert = await this.alertCntrl.create({
      header: 'Campos incompletos',
      message: 'Introducir nivel de dolor',
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
            this.dismissModal();
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