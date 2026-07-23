import { TestBed } from '@angular/core/testing';

import { EditGridService } from './edit-grid-service';

describe('EditGridService', () => {
  let service: EditGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
