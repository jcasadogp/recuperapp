import { TestBed } from '@angular/core/testing';

import { EvaService } from './eva.service';

describe('EvaService', () => {
  let service: EvaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
