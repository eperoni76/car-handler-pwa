import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuovaAuto } from './nuova-auto';

describe('NuovaAuto', () => {
  let component: NuovaAuto;
  let fixture: ComponentFixture<NuovaAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuovaAuto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuovaAuto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
