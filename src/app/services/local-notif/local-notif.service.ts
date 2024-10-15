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

  hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  async scheduleNotification(date){

    console.log(new Date(date))

    let notifications = this.questFrecuencies.map((f, index) => {
      const notificationTime = new Date(date);
      const notificationList: LocalNotificationSchema[] = [];
    
      for (let i of [0, 3, 5, 7]) {
        const time = new Date(notificationTime);
    
        if (i == 0) {
          time.setMonth(time.getMonth() + f);
          time.setHours(12, 0, 0, 0);
    
          notificationList.push({
            id: index * 10 + i,
            title: "Completar cuestionarios",
            body: "Debe completar los cuestionarios después de " + f + " mes(es) desde la cirugía",
            schedule: { at: time },
          });
    
        } else {
          
          time.setMonth(time.getMonth() + f);
          time.setDate(time.getDate() + i);
          time.setHours(12, 0, 0, 0);
    
          notificationList.push({
            id: index * 10 + i,
            title: "Recordatorio cuestionarios",
            body: "No ha completado alguno de los cuestionarios de después de " + f + " mes(es) desde la cirugía",
            schedule: { at: time },
          });
        }
      }
    
      return notificationList;
    }).reduce((acc, val) => acc.concat(val), []);
    
    let options: ScheduleOptions = {
      notifications: notifications
    };

    console.log("** Activaríamos", options)

    try{
      await LocalNotifications.schedule(options)
    } catch (ex) {
      alert(JSON.stringify(ex))
    }
  }

  async cancelNotifications(ids): Promise<void>{

    console.log("** Cancelaríamos")

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
    console.log("** Pendientes")
    return await LocalNotifications.getPending()
  }

  // async scheduleNotification_old(questName, firstDate){

  //   console.log(new Date(firstDate))

  //   const questNameMapping: { [key: string]: string } = {
  //     'facseg': 'valoración funcional de la marcha',
  //     'monitoring': 'seguimiento',
  //     'barthelseg': 'Barthel',
  //     'neuroqol': 'movilidad de las extremidades inferiores'
  //   };
    
  //   const questName2 = questNameMapping[questName] || 'Desconocido';

  //   let notifications = this.questFrecuencies.map((f, index) => {
  //     const notificationTime = new Date(firstDate);
      
  //     notificationTime.setMonth(notificationTime.getMonth() + f);
  //     notificationTime.setHours(12, 0, 0, 0);
    
  //     return {
  //       id: this.hashCode(questName) + index,
  //       title: "Rellenar cuestionarios",
  //       body: "Debe rellenar el cuestionario " + questName2,
  //       schedule: { at: notificationTime}
  //     };
  //   });
    
  //   let options: ScheduleOptions = {
  //     notifications: notifications
  //   };

  //   console.log(options)

  //   try{
  //     await LocalNotifications.schedule(options)
  //   } catch (ex) {
  //     alert(JSON.stringify(ex))
  //   }
  // }

}
