import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingInicialPage } from './loading-inicial.page';

describe('LoadingInicialPage', () => {
  let component: LoadingInicialPage;
  let fixture: ComponentFixture<LoadingInicialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingInicialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
