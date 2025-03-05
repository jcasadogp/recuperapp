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

  /**
   * Calculates and stores questionnaire dates based on a participant's surgery date and given frequencies.
   * 
   * This function retrieves the baseline data for a participant to get the surgery date, then 
   * calculates future questionnaire dates based on the provided frequencies. The calculated dates 
   * are then stored in local storage.
   * 
   * @param {string} participantId - The unique identifier of the participant.
   * @param {number[]} questFrequencies - An array of numbers representing the months after surgery when questionnaires should be completed.
   * 
   * @returns {Promise<void>} A promise that resolves once the dates are calculated and stored.
   * 
   * @throws Will log an error if retrieving baseline data or storing dates fails.
   */
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

  /**
   * Retrieves the stored questionnaire dates from local storage.
   * 
   * This function fetches the stored dates that indicate when questionnaires 
   * should be completed based on the participant's surgery date.
   * 
   * @returns {Promise<{ [key: number]: string } | null>} A promise that resolves 
   *          with an object mapping months to corresponding questionnaire dates, 
   *          or `null` if no data is found.
   */
  async getQuestDates(): Promise<{ [key: number]: string } | null> {
    return await this.storage.get(this.QUEST_DATES_KEY);
  }

  /**
   * Retrieves the stored surgery date from local storage.
   * 
   * This function fetches the date of surgery that was previously stored 
   * in local storage for the participant.
   * 
   * @returns {Promise<string | null>} A promise that resolves with the stored 
   *          surgery date as a string (in ISO format) or `null` if no date is found.
   */
  async getSurgeryDate(): Promise<string | null> {
    return await this.storage.get(this.SURGERY_DATE_KEY);
  }

}
