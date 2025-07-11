import { Injectable } from '@angular/core';
import { CancelOptions, LocalNotifications, LocalNotificationSchema, PendingResult, ScheduleOptions } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class LocalNotifService {

  questFrecuencies: number[];

  constructor() { 
    this.questFrecuencies = [1, 3, 4, 6, 9, 12]
    this.registerForegroundNotifications(); // Ensure foreground notifications show on iOS
  }

  /**
   * Request notification permissions (iOS required)
   */
  async requestPermission(): Promise<boolean> {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  }

  /**
   * Schedules a series of local notifications to remind the user to complete questionnaires.
   * 
   * This function generates notifications based on predefined frequencies (`questFrecuencies`) 
   * relative to a given surgery date. It schedules:
   * - An initial notification exactly `f` months after the surgery.
   * - Additional reminder notifications at 3, 5, and 7 days after the initial notification.
   * 
   * Notifications are only scheduled if their time is in the future.
   * 
   * Before scheduling, the function checks if the user has granted notification permissions.
   * If permissions are denied, the scheduling process is aborted.
   * 
   * @param {string} name - The name of the patient or user.
   * @param {string | Date} date - The surgery date, used as the reference point for scheduling.
   * 
   * @returns {Promise<void>} A promise that resolves when the notifications are successfully scheduled,
   * or rejects if permissions are denied.
   */
  async scheduleNotification(name, date) {
    console.log("   => NOTIF SERVICE => surgery date:", new Date(date));

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.error("Notification permission denied");
      return;
    }

    let notifications = this.questFrecuencies.map(f => {
      const surgeryTime = new Date(date);
      let notificationList: LocalNotificationSchema[] = [];

      for (let i of [0, 3, 5, 7]) {
        const time = new Date(surgeryTime);
    
        if (i == 0) {
          time.setMonth(time.getMonth() + f);
          time.setHours(12, 0, 0, 0);
          
          notificationList.push({
            id: f * 10 + i,
            title: "¡Completar cuestionarios!",
            body: `${name}, debe completar los cuestionarios después de ${f} ${f === 1 ? "mes" : "meses"} desde la cirugía`,
            schedule: { at: time },
            sound: 'default'
          });
    
        } else {
          time.setMonth(time.getMonth() + f);
          time.setDate(time.getDate() + i);
          time.setHours(12, 0, 0, 0);
          
          notificationList.push({
            id: f * 10 + i,
            title: "¡Recordatorio cuestionarios!",
            body: `${name}, recuerde completar los cuestionarios después de ${f} ${f === 1 ? "mes" : "meses"} desde la cirugía`,
            schedule: { at: time },
            sound: 'default'
          });
        }
      }

      // Filter out past notifications
      notificationList = notificationList.filter(n => n.schedule?.at && n.schedule.at.getTime() > Date.now());
    
      return notificationList;
    }).reduce((acc, val) => acc.concat(val), []);

    console.log("   => NOTIF SERVICE => final notifications - ", notifications);
    
    let options: ScheduleOptions = { notifications };

    try {
      await LocalNotifications.schedule(options);
      console.log(" -- Notification scheduled successfully");
    } catch (ex) {
      alert(JSON.stringify(ex));
    }
  }

  /**
   * Ensure local notifications appear when the app is in the foreground (iOS)
   */
  registerForegroundNotifications() {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log("Foreground notification received", notification);

      // Show an alert when a notification arrives in the foreground
      alert(`📢 ${notification.title}\n${notification.body}`);
    });
  }

  /**
   * Cancels scheduled local notifications based on the provided notification IDs.
   * 
   * This function takes an array of notification IDs and attempts to cancel them using 
   * the `LocalNotifications.cancel()` method. If the cancellation is successful, a 
   * confirmation message is logged to the console.
   * 
   * @param {number[]} ids - An array of notification IDs to be canceled.
   * 
   * @returns {Promise<void>} A promise that resolves when the notifications are successfully canceled.
   */
  async cancelNotifications(ids): Promise<void>{

    console.log("*** Entered cancel notifications in the local notif servuce", ids)
    
    // let options: CancelOptions = {
    //   notifications: ids.map(id => ({ id }))
    // };

    let options: CancelOptions = {
      notifications: ids // already in the form [{ id: number }]
    };

    try{
      await LocalNotifications.cancel(options)
      console.log(" -- Notification canceled successfully", options);
    } catch (ex) {
      alert(JSON.stringify(ex))
    }
  }
  
  /**
   * Retrieves a list of all pending (scheduled but not yet triggered) local notifications.
   * 
   * This function calls `LocalNotifications.getPending()` to fetch all notifications 
   * that are currently scheduled but have not been delivered yet.
   * 
   * @returns {Promise<PendingResult>} A promise that resolves with the list of pending notifications.
   */
  async getPendingNotifications(): Promise<PendingResult> {
    return await LocalNotifications.getPending()
  }

}
