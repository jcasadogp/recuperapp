import { TestBed } from '@angular/core/testing';

import { LocalNotifService } from './local-notif.service';

describe('LocalNotifService', () => {
  let service: LocalNotifService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalNotifService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
