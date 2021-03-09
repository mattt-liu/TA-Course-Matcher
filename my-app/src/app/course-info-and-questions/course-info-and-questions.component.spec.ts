import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseInfoAndQuestionsComponent } from './course-info-and-questions.component';

describe('CourseInfoAndQuestionsComponent', () => {
  let component: CourseInfoAndQuestionsComponent;
  let fixture: ComponentFixture<CourseInfoAndQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseInfoAndQuestionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseInfoAndQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
