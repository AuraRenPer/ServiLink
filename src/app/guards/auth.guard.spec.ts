import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [AuthGuard, { provide: AuthService, useValue: mockAuthService }]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  const mockAuthService = {
    getToken: () => {
      return btoa(JSON.stringify({ role: 'master' })); // Simular token con role: master
    }
  };

  it('Debe permitir acceso a Admin Users si el usuario es master', () => {
    const route: any = { data: { roles: ['master'] } };
    const state: any = {};

    expect(guard.canActivate(route, state)).toBeTrue();
  });

  it('Debe bloquear acceso a Admin Users si el usuario NO es master', () => {
    spyOn(mockAuthService, 'getToken').and.returnValue(btoa(JSON.stringify({ role: 'user' })));

    const route: any = { data: { roles: ['master'] } };
    const state: any = {};

    expect(guard.canActivate(route, state)).toBeFalse();
  });
});
