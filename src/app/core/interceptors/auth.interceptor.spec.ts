import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: typeof authInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header when token exists', (done) => {
    const token = 'test-token';
    localStorage.setItem('authToken', token);

    const request = new HttpRequest('GET', '/api/test');
    const next: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.headers.has('Authorization')).toBe(true);
        expect(req.headers.get('Authorization')).toBe(`Bearer ${token}`);
        done();
        return of({} as HttpEvent<any>);
      },
    };

    interceptor(request, next).subscribe();
  });

  it('should not add Authorization header when token does not exist', (done) => {
    localStorage.removeItem('authToken');

    const request = new HttpRequest('GET', '/api/test');
    const next: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.headers.has('Authorization')).toBe(false);
        done();
        return of({} as HttpEvent<any>);
      },
    };

    interceptor(request, next).subscribe();
  });
});

