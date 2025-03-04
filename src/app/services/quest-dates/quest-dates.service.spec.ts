import { TestBed } from '@angular/core/testing';

import { QuestDatesService } from './quest-dates.service';

describe('QuestDatesService', () => {
  let service: QuestDatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestDatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
