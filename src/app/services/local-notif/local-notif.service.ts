import { Injectable } from '@angular/core';
import { LocalNotifications, PendingLocalNotificationSchema, PendingResult, ScheduleOptions } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class LocalNotifService {

  questFrecuencies: number[];

  constructor() { 
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]
  }

  hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  async scheduleNotification(questName, firstDate){

    console.log(new Date(firstDate))

    const questNameMapping: { [key: string]: string } = {
      'facseg': 'valoración funcional de la marcha',
      'monitoring': 'seguimiento',
      'barthelseg': 'Barthel',
      'neuroqol': 'movilidad de las extremidades inferiores'
    };
    
    const questName2 = questNameMapping[questName] || 'Desconocido';

    let notifications = this.questFrecuencies.map((f, index) => {
      const notificationTime = new Date(firstDate);
      
      notificationTime.setMonth(notificationTime.getMonth() + f);
      notificationTime.setHours(12, 0, 0, 0);
    
      return {
        id: this.hashCode(questName) + index,
        title: "Rellenar cuestionarios",
        body: "Debe rellenar el cuestionario " + questName2,
        schedule: { at: notificationTime}
      };
    });
    
    let options: ScheduleOptions = {
      notifications: notifications
    };

    console.log(options)

    try{
      await LocalNotifications.schedule(options)
    } catch (ex) {
      alert(JSON.stringify(ex))
    }
  }
  
  async getPendingNotifications(): Promise<PendingResult> {
    return await LocalNotifications.getPending()
  }
}
