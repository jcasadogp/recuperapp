import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { LoadingController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';
import { Device } from '@capacitor/device';
import { firstValueFrom } from 'rxjs';
import { QuestsService } from '../services/quests/quests.service';

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

  login_error_msg: boolean;

  constructor(
    private loginSrvc: LoginService,
    private router: Router,
    private storageSrvc: StorageService,
    public loadingController: LoadingController,
    private questsSrvc: QuestsService
  ) {}

  ngOnInit() {}

  async login() {
    this.login_error_msg = false;
    const id = this.login_params.user;
    
    this.presentLoading();
    
    try {
      const data = await firstValueFrom(this.loginSrvc.getUser(id));
      
      if (!data || data.length === 0) {
        this.login_error_msg = true;
        this.login_params = { user: '', password: '' };
        await this.loadingController.dismiss();
        throw new Error("User not found");
      }

      const pw = data[0].contrasena;
      if (pw !== this.login_params.password) {
        this.login_error_msg = true;
        this.login_params.password = '';
        await this.loadingController.dismiss();
        throw new Error("Incorrect password");
      }

      console.log("=> 1-A. Password OK");

      // Store user ID
      await this.storageSrvc.set('RECORD_ID', id);
      
      // Get Device ID and registered devices - Determine if it's the first login on this device
      const deviceId = (await Device.getId()).identifier;
      const deviceIds = await firstValueFrom(this.loginSrvc.getDevices(id));
      const isFirstTime = !deviceIds.includes(deviceId);
      await this.storageSrvc.set('FIRST_TIME_DEVICE', isFirstTime ? 1 : 0);

      if (isFirstTime) {
        await this.loginSrvc.addDevice(id, deviceId);
      }

      console.log("=> 1-B. isFirstTime set in the storage");

      // Call `onLoginSuccess()` to store quest dates
      await this.onLoginSuccess(id);
      console.log("=> 1-C. Stored quest dates and surgery date");

      // Close loading and navigate
      await this.loadingController.dismiss();
      this.router.navigateByUrl('tabs');
      
      // Reset login form
      this.login_error_msg = false;
      this.login_params = { user: '', password: '' };

    } catch (err) {
      await this.loadingController.dismiss();
    }
  }

  async onLoginSuccess(userId: string) {
    try {
      const questFrequencies = [1, 3, 4, 6, 9, 12];
      await this.questsSrvc.calculateAndStoreQuestDates(userId, questFrequencies);
    } catch (error) {
      console.error("Error storing quest dates:", error);
    }
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
