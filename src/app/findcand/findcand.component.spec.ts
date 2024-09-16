import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindcandComponent } from './findcand.component';

describe('FindcandComponent', () => {
  let component: FindcandComponent;
  let fixture: ComponentFixture<FindcandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindcandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FindcandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
