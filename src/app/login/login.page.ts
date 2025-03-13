import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { Device } from '@capacitor/device';

// Services
import { StorageService } from 'src/app/services/storage/storage.service';
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

  login_error_msg: boolean;

  constructor(
    private loginSrvc: LoginService,
    private router: Router,
    private storageSrvc: StorageService,
    public loadingController: LoadingController
  ) {}

  ngOnInit() {}

  /**
   * Handles the user login process.
   * 
   * - Validates user credentials.
   * - Stores user ID in local storage.
   * - Checks if this is the first login on the current device.
   * - Stores necessary user-related data.
   * - Navigates to the main app screen upon successful login.
   */
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

  /**
   * Handles post-login processes for a user.
   * 
   * - Calculates and stores quest dates based on predefined frequencies.
   * - Ensures quest scheduling data is available for the logged-in user.
   * 
   * @param userId The ID of the logged-in user.
   */
  async onLoginSuccess(userId: string) {
    try {
      const questFrequencies = [1, 3, 4, 6, 9, 12];
      await this.loginSrvc.calculateAndStoreQuestDates(userId, questFrequencies);
    } catch (error) {
      console.error("Error storing quest dates:", error);
    }
  }
  
  /**
   * Displays a loading indicator while the user login process is in progress.
   * 
   * - Shows a message indicating the login process.
   * - Uses iOS-style modal for consistency.
   * - Waits for the loading indicator to be dismissed.
   */
    async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      mode: 'ios'
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

}
