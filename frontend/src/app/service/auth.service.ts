import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, Subject, tap } from 'rxjs';
import { LoginRequest } from "../model/request/LoginRequest";
import { RegisterRequest } from "../model/request/RegisterRequest";
import { AuthResponse } from "../model/response/AuthResponse";
import { ErrorHandlingService } from "./error-handling.service";
import { Router } from "@angular/router";
import { User } from "../model/entity/User";
import { LoggedInUserService } from "./logged-in-user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `http://localhost:8080/api/auth`;
  private userLoggedInAndOutSubject = new Subject<void>();
  userLoggedInAndOut$ = this.userLoggedInAndOutSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService,
    private router: Router,
    private injector: Injector,
  ) {}

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse | undefined> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.token) {
            sessionStorage.setItem('token', response.token);
            this.userLoggedInAndOutSubject.next();
          }
        }),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  logout(): void {
    this.http.get<AuthResponse>(`${this.apiUrl}/logout`)
      .pipe(
        catchError(error => {
          this.errorHandlingService.handleError(error);
          return of(null);
        })
      )
      .subscribe(() => {
        sessionStorage.removeItem('token');
        this.router.navigate(['/login']).then(() => {});
      });
  }

  getLoggedInUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/logged-in-user`).pipe(
      catchError(error => {
        this.errorHandlingService.handleError(error);
        return of(null);
      })
    );
  }
}
