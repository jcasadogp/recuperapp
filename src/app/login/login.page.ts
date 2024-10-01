import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { LoadingController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  login_params = {
    user: "",
    password: ""
  }

  validate_data: boolean;


  constructor(
    private loginSrvc: LoginService,
    private router: Router,
    private storageSrvc: StorageService,
    public loadingController: LoadingController
  ) {}

  ngOnInit() {}

  login(){
    this.validate_data = true;

    var id = this.login_params.user;
    this.presentLoading();
    
    this.loginSrvc.getUser(id).subscribe(async data => {
      if(data.length === 0) {
        //El usuario introducido no existe
        this.validate_data = false;
        this.login_params = {
          user: '',
          password: ''
        };
        
        this.loadingController.dismiss();
      } else {
        var pw = data[0].contrasena;
        if(pw == this.login_params.password){
          //Se accede a la pantalla principal de la aplicación
          console.log("A. password OK")
          await this.storageSrvc.set('RECORD_ID', this.login_params.user);
          console.log("B. Storage setted")
          await this.loadingController.dismiss();
          console.log("C. Loading dismissed")
          this.router.navigateByUrl('tabs');
          console.log("D. routing to tabs")

          //Se inicializan los parametros
          this.validate_data = true;
          this.login_params = { user: '', password: '' };

        } else {
          //La contraseña introducida no es correcta
          this.validate_data = false;
          this.login_params = { user: this.login_params.user, password: '' };
          this.loadingController.dismiss();
        }
      }
    })
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Iniciando sesión...',
      mode: 'ios'
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

}
