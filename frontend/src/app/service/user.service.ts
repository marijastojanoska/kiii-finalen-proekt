import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {User} from '../model/entity/User';
import {LoginRequest} from '../model/request/LoginRequest';
import {UserUpdateRequest} from '../model/request/UserUpdateRequest';
import {PageableByStringRequest} from '../model/request/PageableByStringRequest';
import {ErrorHandlingService} from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/users';

  private userUpdatedSubject = new Subject<User>();
  private userDeactivatedSubject = new Subject<any>();

  userUpdated$ = this.userUpdatedSubject.asObservable();
  userDeactivated$ = this.userDeactivatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService
  ) {
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${username}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  searchUsersByUsernamePageable(username: string, size: number): Observable<any> {
    const pageableByStringRequest: PageableByStringRequest = {word: username, page: 0, size: size};
    return this.http.post<any>(`${this.apiUrl}/search-by-username/pageable`, pageableByStringRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  deactivate(username: string, password: string): Observable<any> {
    const loginRequest: LoginRequest = {username, password};
    return this.http.post<any>(`${this.apiUrl}/deactivate`, loginRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(response => this.userDeactivatedSubject.next(response))
      );
  }

  updateUser(
    username: string,
    oldPassword?: string,
    password?: string,
    confirmPassword?: string,
    email?: string,
    firstName?: string,
    lastName?: string
  ): Observable<User> {
    const userUpdateRequest: UserUpdateRequest = {
      username,
      oldPassword,
      password,
      confirmPassword,
      email,
      firstName,
      lastName
    };
    return this.http.put<User>(`${this.apiUrl}/${username}`, userUpdateRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(user => this.userUpdatedSubject.next(user))
      );
  }
}
