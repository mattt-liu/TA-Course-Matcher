import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustTahoursComponent } from './adjust-tahours.component';

describe('AdjustTahoursComponent', () => {
  let component: AdjustTahoursComponent;
  let fixture: ComponentFixture<AdjustTahoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustTahoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustTahoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
