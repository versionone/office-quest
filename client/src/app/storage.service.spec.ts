import { TestBed, inject } from '@angular/core/testing';

import { storageService } from './storage.service';

describe('storageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        storageService,
      ]
    });
  });

  it('should be created', inject([storageService], (service: storageService) => {
    expect(service).toBeTruthy();
  }));
});
