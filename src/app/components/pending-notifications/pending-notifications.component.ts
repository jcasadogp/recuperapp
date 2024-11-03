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

      let { pastNotif, upcomingNotif } = this.filterNotifications(pendingNotif);

      console.log('Past Notifications:', pastNotif);

      // Cancel past notifications
      await this.cancelPastNotifications(pastNotif)
  
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

  async cancelPastNotifications(pastNotif: PendingLocalNotificationSchema[]){
    
    const cancelIds = pastNotif.map(notification => {
      return { id: notification.id };
    });

    await this.notifSrvc.cancelNotifications(cancelIds)
  }

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

  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }

}
