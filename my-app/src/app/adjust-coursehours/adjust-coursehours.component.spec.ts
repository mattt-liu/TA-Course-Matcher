import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustCoursehoursComponent } from './adjust-coursehours.component';

describe('AdjustCoursehoursComponent', () => {
  let component: AdjustCoursehoursComponent;
  let fixture: ComponentFixture<AdjustCoursehoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustCoursehoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustCoursehoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
