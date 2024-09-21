import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../model/entity/User';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggedInUserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.userLoggedInAndOut$.pipe(
      switchMap(() => this.loadUser())
    ).subscribe({
      next: (user) => this.userSubject.next(user),
      error: (err) => console.error('Error fetching user:', err)
    });
  }

  loadUser(): Observable<User | null> {
    return this.authService.getLoggedInUser().pipe(
      tap({
        next: (user) => this.userSubject.next(user),
        error: (err) => console.error('Error fetching user:', err)
      })
    );
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
