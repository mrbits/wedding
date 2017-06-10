import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDialogComponent } from './find-dialog.component';

describe('FindDialogComponent', () => {
  let component: FindDialogComponent;
  let fixture: ComponentFixture<FindDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
