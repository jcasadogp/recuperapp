import { Component, OnInit } from '@angular/core';
import { PendingLocalNotificationSchema, PendingResult } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { LocalNotifService } from 'src/app/services/local-notif/local-notif.service';

@Component({
  selector: 'app-pending-notifications',
  templateUrl: './pending-notifications.component.html',
  styleUrls: ['./pending-notifications.component.scss'],
})
export class PendingNotificationsComponent  implements OnInit {

  notifications;
  groupedNotifications;

  constructor(
    private notifSrvc: LocalNotifService,
    private modalCntrl: ModalController
  ) { }

  /**
   * Lifecycle hook that runs when the component is initialized.
   * 
   * - Calls `getPendingNotifications()` to retrieve any pending notifications.
   * - Ensures notification status is checked as soon as the component loads.
   */
  ngOnInit() {
    this.getPendingNotifications();
  }

  /**
   * Retrieves and processes pending notifications.
   * 
   * - Fetches pending notifications from the notification service.
   * - Filters notifications into past and upcoming categories.
   * - Cancels past notifications to ensure cleanup.
   * - Sorts upcoming notifications by date.
   * - Groups notifications by formatted date for display.
   * - Stores the grouped notifications for further use.
   */
  async getPendingNotifications() {
    try {
      let pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
      let pendingNotif = pendingNotifications.notifications;

      console.log('Pending Notifications:', pendingNotif);
      
      let { pastNotif, upcomingNotif } = this.filterNotifications(pendingNotif);

      // Cancel past notifications if there are any
      if (pastNotif.length > 0) {
        console.log('Past Notifications:', pastNotif);
        await this.cancelPastNotifications(pastNotif);
      }

      // Sort by date
      upcomingNotif.sort((a, b) => {
        const dateA = a.schedule?.at ? new Date(a.schedule.at) : new Date(0);
        const dateB = b.schedule?.at ? new Date(b.schedule.at) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
  
      console.log('Upcoming Notifications:', upcomingNotif);
  
      const groupedNotifications = new Map<string, any[]>();
  
      upcomingNotif.forEach(notif => {
        const dateObject = notif.schedule?.at ? new Date(notif.schedule.at) : null;
        if (dateObject) {
          const dateKey = dateObject.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
  
          if (!groupedNotifications.has(dateKey)) {
            groupedNotifications.set(dateKey, []);
          }
  
          groupedNotifications.get(dateKey)?.push({
            id: notif.id,
            title: notif.title,
            body: notif.body,
            quest: notif.body.replace('Debe rellenar el cuestionario ', ''),
            time: dateObject.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          });
        }
      });
  
      // Convert map to array of objects
      this.groupedNotifications = Array.from(groupedNotifications, ([date, notifications]) => ({date,notifications}));
  
      // Sort the grouped notifications by date
      this.groupedNotifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    } catch (err) {
      console.error('Error getting pending notifications:', err);
    }
  }

  /**
   * Cancels past notifications to prevent outdated alerts.
   * 
   * - Extracts notification IDs from the provided past notifications.
   * - Calls the notification service to cancel these notifications.
   * 
   * @param pastNotif - An array of past notifications that need to be canceled.
   */
  async cancelPastNotifications(pastNotif: PendingLocalNotificationSchema[]){
    
    const cancelIds = pastNotif.map(notification => {
      return { id: notification.id };
    });

    await this.notifSrvc.cancelNotifications(cancelIds)
  }

  /**
   * Filters pending notifications into past and upcoming categories.
   * 
   * - Separates notifications based on whether their scheduled time is before or after today.
   * - Ensures only valid notifications with a scheduled time are processed.
   * - Helps manage notifications by allowing cancellation of past ones and display of upcoming ones.
   * 
   * @param pendingNotif - Array of pending notifications to be categorized.
   * @returns An object containing arrays of past and upcoming notifications.
   */
  filterNotifications(pendingNotif: PendingLocalNotificationSchema[] | null | undefined) {
    
    if (pendingNotif === null || pendingNotif === undefined) {
      return { pastNotif: [], upcomingNotif: [] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastNotif: PendingLocalNotificationSchema[] = [];
    const upcomingNotif: PendingLocalNotificationSchema[] = [];

    pendingNotif.forEach(notification => {
      if (notification.schedule && notification.schedule.at) {
        const notificationDate = new Date(notification.schedule.at);
        
        if (notificationDate < today) {
          pastNotif.push(notification);
        } else {
          upcomingNotif.push(notification);
        }
      }
    });

    return { pastNotif, upcomingNotif };
  }

  /**
  * Handles modal dismissal.
  * 
  * - If the form is empty, dismisses the modal immediately.
  * - If the form contains data, prompts the user with a confirmation alert before closing.
  */
  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }

}
