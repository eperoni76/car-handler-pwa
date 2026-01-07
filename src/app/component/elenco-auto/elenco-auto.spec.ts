import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElencoAuto } from './elenco-auto';

describe('ElencoAuto', () => {
  let component: ElencoAuto;
  let fixture: ComponentFixture<ElencoAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElencoAuto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElencoAuto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
