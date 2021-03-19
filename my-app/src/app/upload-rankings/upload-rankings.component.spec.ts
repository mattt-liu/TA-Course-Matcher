import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRankingsComponent } from './upload-rankings.component';

describe('UploadRankingsComponent', () => {
  let component: UploadRankingsComponent;
  let fixture: ComponentFixture<UploadRankingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadRankingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRankingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
