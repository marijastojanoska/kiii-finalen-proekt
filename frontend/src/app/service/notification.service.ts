import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {ErrorHandlingService} from './error-handling.service';
import {Notification} from '../model/entity/Notification';
import {PageableByStringRequest} from '../model/request/PageableByStringRequest';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  private notificationReadSubject = new Subject<Notification>();
  private notificationDeletedSubject = new Subject<number>();
  private allNotificationsDeletedSubject = new Subject<void>();
  private allNotificationsReadSubject = new Subject<void>();

  notificationRead$ = this.notificationReadSubject.asObservable();
  notificationDeleted$ = this.notificationDeletedSubject.asObservable();
  allNotificationsDeleted$ = this.allNotificationsDeletedSubject.asObservable();
  allNotificationsRead$ = this.allNotificationsReadSubject.asObservable();

  constructor(private http: HttpClient, private errorHandlingService: ErrorHandlingService) {}

  getNotificationsForUser(username: string, size: number): Observable<Notification[]> {
    const pageableRequest: PageableByStringRequest = {word: username, page: 0, size: size};
    return this.http.post<any>(`${this.apiUrl}/get-by-user/pageable`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  countByUserUsernameAndReadFalse(username: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count/${username}`)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }


  markNotificationAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/mark-as-read/${id}`, {})
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(notification => this.notificationReadSubject.next(notification))
      );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.notificationDeletedSubject.next(id))
      );
  }

  deleteAllNotifications(username: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete-all/${username}`, {})
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.allNotificationsDeletedSubject.next())
      );
  }

  markAsReadAllNotifications(username: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-as-read-all/${username}`, {})
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.allNotificationsReadSubject.next())
      );
  }
}
