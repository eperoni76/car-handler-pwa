import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettaglioAuto } from './dettaglio-auto';

describe('DettaglioAuto', () => {
  let component: DettaglioAuto;
  let fixture: ComponentFixture<DettaglioAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DettaglioAuto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DettaglioAuto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
