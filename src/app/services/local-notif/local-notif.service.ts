import { Injectable } from '@angular/core';
import { CancelOptions, LocalNotifications, LocalNotificationSchema, PendingLocalNotificationSchema, PendingResult, ScheduleOptions } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class LocalNotifService {

  questFrecuencies: number[];

  constructor() { 
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]
  }

  // hashCode(str: string): number {
  //   let hash = 0;
  //   for (let i = 0; i < str.length; i++) {
  //     const char = str.charCodeAt(i);
  //     hash = (hash << 5) - hash + char;
  //     hash |= 0;
  //   }
  //   return Math.abs(hash);
  // }

  async scheduleNotification(name, date){

    console.log("NOTIF SERVICE =>", new Date(date))

    let notifications = this.questFrecuencies.map((f, index) => {
      const notificationTime = new Date(date);
      let notificationList: LocalNotificationSchema[] = [];
    
      for (let i of [0, 3, 5, 7]) {
        const time = new Date(notificationTime);
    
        if (i == 0) {
          time.setMonth(time.getMonth() + f);
          time.setHours(12, 0, 0, 0);
    
          notificationList.push({
            id: index * 10 + i,
            title: "Completar cuestionarios",
            body: `${name}, debe completar los cuestionarios después de ${f} ${f === 1 ? "mes" : "meses"} desde la cirugía`,
            schedule: { at: time },
          });
    
        } else {
          
          time.setMonth(time.getMonth() + f);
          time.setDate(time.getDate() + i);
          time.setHours(12, 0, 0, 0);
    
          notificationList.push({
            id: index * 10 + i,
            title: "Recordatorio cuestionarios",
            body: `${name}, recuerde completar los cuestionarios después de ${f} ${f === 1 ? "mes" : "meses"} desde la cirugía`,
            schedule: { at: time },
          });
        }
      }

      // **Filter out past notifications**
      notificationList = notificationList.filter(n => n.schedule?.at && n.schedule.at.getTime() > Date.now());
    
      return notificationList;
    }).reduce((acc, val) => acc.concat(val), []);

    console.log("NOTIF SERVICE =>", notifications)
    
    let options: ScheduleOptions = {
      notifications: notifications
    };

    try{
      console.log(" -*-*-*-* Scheduling Notification with options:", options);
      await LocalNotifications.schedule(options)
      console.log(" -*-*-*-* Notification scheduled successfully");
    } catch (ex) {
      alert(JSON.stringify(ex))
    }
  }

  async cancelNotifications(ids): Promise<void>{

    let options: CancelOptions = {
      notifications: ids
    };

    try{
      await LocalNotifications.cancel(options)
    } catch (ex) {
      alert(JSON.stringify(ex))
    }
  }
  
  async getPendingNotifications(): Promise<PendingResult> {
    return await LocalNotifications.getPending()
  }
}
