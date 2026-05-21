import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilotBriefingComponent } from './pilot-briefing.component';

describe('PilotBriefingComponent', () => {
  let component: PilotBriefingComponent;
  let fixture: ComponentFixture<PilotBriefingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilotBriefingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PilotBriefingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
