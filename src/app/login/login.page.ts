import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { LoadingController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';
import { Device } from '@capacitor/device';
import { firstValueFrom } from 'rxjs';

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
      // El usuario introducido no existe
      if(data.length === 0) {
        this.validate_data = false;
        this.login_params = { user: '', password: '' };
        await this.loadingController.dismiss();
      
        // El usuario introducido sí existe
      } else {
        var pw = data[0].contrasena;

        // Se accede a la pantalla principal de la aplicación
        if(pw == this.login_params.password){
          console.log("A. password OK");
          await this.storageSrvc.set('RECORD_ID', this.login_params.user);
          
          const deviceId = (await Device.getId()).identifier;
          console.log("++ Device Id:", deviceId);
  
          try {
            // Convert the getDevices Observable to a Promise
            const deviceIds = await firstValueFrom(this.loginSrvc.getDevices(id));
            console.log("++ device ids", deviceIds);
  
            if (deviceIds.includes(deviceId)) {
              console.log("++ User already did login on this device.");
              await this.storageSrvc.set('FIRST_TIME_DEVICE', 0);
            } else {
              console.log("++ User hadn't done login on this device.");
              await this.storageSrvc.set('FIRST_TIME_DEVICE', 1);
              await this.loginSrvc.addDevice(id, deviceId);
            }
  
            // Only proceed after all asynchronous operations have completed
            console.log("B. Storage setted");
            await this.loadingController.dismiss();
            console.log("C. Loading dismissed");
            this.router.navigateByUrl('tabs');
            console.log("D. routing to tabs");
  
            // Se inicializan los parametros
            this.validate_data = true;
            this.login_params = { user: '', password: '' };
          } catch (err) {
            console.error("Error in device handling:", err);
            this.loadingController.dismiss();
          }
        } else {
          // La contraseña introducida no es correcta
          this.validate_data = false;
          this.login_params = { user: this.login_params.user, password: '' };
          await this.loadingController.dismiss();
        }
      }
    });
  }
  

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      mode: 'ios'
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

}
