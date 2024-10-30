import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateJobListingComponent } from './update-job-listing.component';

describe('UpdateJobListingComponent', () => {
  let component: UpdateJobListingComponent;
  let fixture: ComponentFixture<UpdateJobListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateJobListingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateJobListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
