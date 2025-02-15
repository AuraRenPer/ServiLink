import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSuccessPage } from './loading-success.page';

describe('LoadingSuccessPage', () => {
  let component: LoadingSuccessPage;
  let fixture: ComponentFixture<LoadingSuccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
