import { TestBed } from '@angular/core/testing';

import { PackageItemServiceApi } from './package-item-service-api';

describe('PackageItemService', () => {
  let service: PackageItemServiceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackageItemServiceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
