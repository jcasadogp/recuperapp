import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { ParticipantService } from '../participant/participant.service';

@Injectable({
  providedIn: 'root'
})
export class QuestDatesService {
  private readonly SURGERY_DATE_KEY = 'SURGERY_DATE';
  private readonly QUEST_DATES_KEY = 'QUEST_DATES';

  constructor(
    private storage: Storage,
    private participantSrvc: ParticipantService
  ) {}

  // Calculate and store quest dates
  async calculateAndStoreQuestDates(participantId: string, questFrequencies: number[]): Promise<void> {
    try {
      const data = await firstValueFrom(this.participantSrvc.getBaselineData(participantId));

      const surgeryDate = data[0].f_cirug_a;
      console.log("Surgery date to storage =>", this.SURGERY_DATE_KEY, surgeryDate)
      await this.storage.set(this.SURGERY_DATE_KEY, surgeryDate);

      let questDates = {};

      for (let f of questFrequencies) {
        let date = new Date(surgeryDate);
        date.setMonth(date.getMonth() + f);
        questDates[f] = date.toISOString().split('T')[0];
      }

      console.log("Quest dates to storage =>", this.QUEST_DATES_KEY, questDates)
      await this.storage.set(this.QUEST_DATES_KEY, questDates);
    } catch (error) {
      console.error('Error calculating quest dates:', error);
    }
  }

  // Retrieve stored quest dates
  async getQuestDates(): Promise<{ [key: number]: string } | null> {
    return await this.storage.get(this.QUEST_DATES_KEY);
  }

  // Retrieve stored surgery date
  async getSurgeryDate(): Promise<string | null> {
    return await this.storage.get(this.SURGERY_DATE_KEY);
  }
}
