import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PendingLocalNotificationSchema, PendingResult } from '@capacitor/local-notifications';
import { ModalController, AlertController } from '@ionic/angular';

// Services
import { StorageService } from 'src/app/services/storage/storage.service';
import { LocalNotifService } from 'src/app/services/local-notif/local-notif.service';
import { ParticipantService } from 'src/app/services/participant/participant.service';

// Redcap Interfaces
import { Participant } from 'src/app/redcap_interfaces/participant';

@Component({
  selector: 'app-pending-notifications',
  templateUrl: './pending-notifications.component.html',
  styleUrls: ['./pending-notifications.component.scss'],
})
export class PendingNotificationsComponent  implements OnInit {

  notifications;
  groupedNotifications;
  public participant: Participant = {};

  constructor(
    private notifSrvc: LocalNotifService,
    private modalCntrl: ModalController,
    private alertCntrl: AlertController,
    private participantSrvc: ParticipantService,
    private storageSrvc: StorageService
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
        await this.cancelScheduledNotifications(pastNotif);
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
   * @param notif - An array of notifications that need to be canceled.
   */
  async cancelScheduledNotifications(notif: PendingLocalNotificationSchema[]){
    
    const cancelIds = notif.map(notification => {
      return { id: notification.id };
    });

    await this.notifSrvc.cancelNotifications(cancelIds)
  }

  /**
   * Cancels upcoming notifications in case the user asks for it.
   * 
   * - Extracts notification IDs from the pending notifications.
   * - Calls the notification service to cancel these notifications.
   * 
   * @param pastNotif - An array of past notifications that need to be canceled.
   */
  async cancelUpcomingNotifications() {
    let pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
    let pendingNotif = pendingNotifications.notifications;

    console.log('Pending Notifications:', pendingNotif);

    let { pastNotif, upcomingNotif } = this.filterNotifications(pendingNotif);
    
    // Cancel past notifications if there are any
    if (upcomingNotif.length > 0) {
      console.log('Upcoming Notifications:', upcomingNotif);
      await this.cancelScheduledNotifications(upcomingNotif);

      // Get pending notifications after having removed them
      await this.getPendingNotifications();
    }

  }

  /**
   * Reschedules upcoming notifications for the user if none are currently pending.
   * 
   * - Checks for existing pending notifications via the notification service.
   * - If no notifications are pending:
   *   - Requests notification permissions from the user.
   *   - Retrieves the user's participant ID and corresponding participant data.
   *   - Retrieves the scheduled surgery date.
   *   - Schedules a new notification using the participant's first name and the surgery date.
   * 
   * Handles possible errors or missing data gracefully:
   * - Logs a warning if no participant ID is found in storage.
   * - Warns if the user denies notification permissions.
   * - Handles empty participant data or scheduling failures.
   * 
   * @returns {Promise<void>} Resolves when the operation completes or fails silently with logs.
   */
  async rescheduleUpcomingNotifications() {
    try {
      let pendingNotifications: PendingResult = await this.notifSrvc.getPendingNotifications();
      let pendingNotif = pendingNotifications.notifications;

      if (pendingNotif.length === 0) {
        console.log("   => there are no pending notifications, rescheduling them");

        const hasPermission = await this.notifSrvc.requestPermission();

        if (hasPermission) {
          let id = await this.storageSrvc.get('RECORD_ID');
          if (!id) {
            console.warn("No RECORD_ID found in storage. Cannot reset notifications.");
            return;
          }

          const data: Participant[] = await firstValueFrom(this.participantSrvc.getParticipant(id));
          if (!data || data.length === 0) {
            console.warn("No participant data found.");
            return;
          }

          this.participant = data[0];

          console.log("   => the user has notifications permissions");
          const surgeryDate = await this.storageSrvc.get("SURGERY_DATE");
          this.notifSrvc.scheduleNotification(this.participant.f645_firstname ?? 'Paciente', surgeryDate);

          // Get pending notifications after having rescheduled them
          await this.getPendingNotifications();

        } else {
          console.warn("User denied notification permissions. Notifications will not be scheduled.");
          alert("Las notificaciones están deshabilitadas. Habilítelas en la configuración del dispositivo.");
        }
      }

    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
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
   * Presents a confirmation alert to the user before cancelling upcoming notifications.
   * 
   * - Displays an alert with "cancel" and "confirm" options.
   * - If the user confirms, it proceeds to cancel future notifications by calling `cancelUpcomingNotifications()`.
   * 
   * This ensures the user does not accidentally delete notifications without intent.
   */
  async confirmCancelUpcomingNotifications() {
    
    const alert = await this.alertCntrl.create({
        header: 'Cancelar futuras notificaciones',
        message: '¿Está seguro de que quiere cancelar todas las futuras notificaciones?',
        buttons: [
          {
            text: 'Sí, cancelarlas',
            cssClass: 'secondary',
            handler: () => {
              this.cancelUpcomingNotifications()
            }
          },{
            text: 'No, mantenerlas',
            role: 'cancel'
          }
        ]
    });

    await alert.present();

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
