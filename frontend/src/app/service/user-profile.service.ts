import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ErrorHandlingService} from './error-handling.service';
import {UserProfile} from '../model/entity/UserProfile';
import {UserProfileRequest} from '../model/request/UserProfileRequest';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly apiUrl = 'http://localhost:8080/api/user-profiles';

  private userProfileSavedSubject = new Subject<UserProfile>();

  userProfileSaved$ = this.userProfileSavedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService) {
  }

  getUserProfileByUsername(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${username}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)),);
  }

  saveUserProfile(userProfile: UserProfileRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}`, userProfile)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(savedUserProfile => this.userProfileSavedSubject.next(savedUserProfile))
      );
  }
}
