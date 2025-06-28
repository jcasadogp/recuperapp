import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'irycis.recuperapp',
  appName: 'RecuperApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#DAF8DF",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
  },
  cordova: {
    preferences: {
      // Add any specific Cordova plugin preferences here if needed
    }
  }
};

export default config;