import { TestBed } from '@angular/core/testing';

import { ForkliftService } from './forklift-service';

describe('ForkliftService', () => {
  let service: ForkliftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForkliftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
