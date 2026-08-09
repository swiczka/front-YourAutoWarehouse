import { TestBed } from '@angular/core/testing';

import { LayoutServiceApi } from './layout-service-api';

describe('LayoutServiceApi', () => {
  let service: LayoutServiceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutServiceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
