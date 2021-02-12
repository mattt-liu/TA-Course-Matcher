import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequireTAPositionsComponent } from './require-tapositions.component';

describe('RequireTAPositionsComponent', () => {
  let component: RequireTAPositionsComponent;
  let fixture: ComponentFixture<RequireTAPositionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequireTAPositionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequireTAPositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
