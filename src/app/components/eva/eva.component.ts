import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { EvaForm } from 'src/app/interfaces/eva-form';
import { EvaService } from 'src/app/services/eva/eva.service';

@Component({
  selector: 'app-eva',
  templateUrl: './eva.component.html',
  styleUrls: ['./eva.component.scss'],
})
export class EvaComponent  implements OnInit {

  public currentDate: string;
  eva_form: EvaForm;

  constructor(
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private toastCntrl: ToastController,
    private evaSrvc: EvaService
  ) { 
    this.currentDate = new Date().toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'})
    this.eva_form = {}
  }

  ngOnInit() {
    this.eva_form.eva = 0;
  }

  postEvaForm(): void {

    if(typeof(this.eva_form.eva) == "number" || this.eva_form.fecha_eva != null){
      
      this.eva_form.fecha_eva = new Date().toISOString().split('T')[0]
      
      this.evaSrvc.postEvaForm(this.eva_form).then(()=>{

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
      cssClass: 'my-custom-class',
      header: 'Campos incompletos',
      message: 'Introducir nivel de dolor',
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
      mode: 'ios',
      color: "success"
    });
    toast.present();
  }
}