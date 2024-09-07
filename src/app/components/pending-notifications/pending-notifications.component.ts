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

  // notifications: PendingLocalNotificationSchema[]
  notifications;
  groupedNotifications;

  constructor(
    private notifSrvc: LocalNotifService,
    private modalCntrl: ModalController
  ) { }

  ngOnInit() {
    this.getPendingNotifications();
  }

  async getPendingNotifications() {
    try {
      let pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
      let pendingNotif = pendingNotifications.notifications;
  
      // Sort by date
      pendingNotif.sort((a, b) => {
        const dateA = a.schedule?.at ? new Date(a.schedule.at) : new Date(0);
        const dateB = b.schedule?.at ? new Date(b.schedule.at) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
  
      console.log('Pending Notifications:', pendingNotif);
  
      const groupedNotifications = new Map<string, any[]>();
  
      pendingNotif.forEach(notif => {
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
            title: notif.title,
            body: notif.body,
            quest: notif.body.replace('Debe rellenar el cuestionario ', ''),
            time: dateObject.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false // 24-hour format
            })
          });
        }
      });
  
      // Convert map to array of objects
      this.groupedNotifications = Array.from(groupedNotifications, ([date, notifications]) => ({date,notifications}));
  
      // Sort the grouped notifications by date
      this.groupedNotifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
      console.log("FINAL:", this.groupedNotifications);
  
    } catch (err) {
      console.error('Error getting pending notifications:', err);
    }
  }
  
  

  async getPendingNotifications_old() {
    try {
      let pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
      let pendingNotif = pendingNotifications.notifications
      console.log('Pending Notifications:', pendingNotif);

      this.notifications = pendingNotif.map(notif => {
        return {
          title: notif.title,
          body: notif.body,
          date: notif.schedule?.at || 'No date available',
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log(this.notifications)
    } catch (err) {
      console.error('Error getting pending notifications:', err);
    }
  }

  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }

}
