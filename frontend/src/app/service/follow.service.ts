import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, forkJoin, map, Observable, Subject, throwError } from 'rxjs';
import { ErrorHandlingService } from './error-handling.service';
import { FollowRequest } from '../model/request/FollowRequest';
import { User } from '../model/entity/User';
import { PageableByStringRequest } from '../model/request/PageableByStringRequest';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private readonly apiUrl = 'http://localhost:8080/api';

  private followedSubject = new Subject<User>();
  private unfollowedSubject = new Subject<User>();
  private followUpdatedSubject = new Subject<{ followersCount: number; followingCount: number }>();

  followed$ = this.followedSubject.asObservable();
  unfollowed$ = this.unfollowedSubject.asObservable();
  followUpdated$ = this.followUpdatedSubject.asObservable();

  constructor(private http: HttpClient, private errorHandlingService: ErrorHandlingService) { }

  follow(follower: string, followed: string): Observable<any> {
    if (followed === follower) {
      return throwError(() => new Error("You cannot follow yourself"));
    }
    const followRequest: FollowRequest = { follower, followed };
    return this.http.post<any>(`${this.apiUrl}/follow`, followRequest).pipe(
      tap(() => this.updateFollowCounts(follower, followed)), // Update counts after follow
      catchError(error => this.errorHandlingService.handleError(error)),
      tap(response => this.followedSubject.next(response))
    );
  }

  unfollow(follower: string, followed: string): Observable<User> {
    const followRequest: FollowRequest = { follower, followed };
    return this.http.post<User>(`${this.apiUrl}/unfollow`, followRequest).pipe(
      tap(() => this.updateFollowCounts(follower, followed)), // Update counts after unfollow
      catchError(error => this.errorHandlingService.handleError(error)),
      tap(response => this.unfollowedSubject.next(response))
    );
  }

  private updateFollowCounts(follower: string, followed: string): void {
    forkJoin({
      followers: this.getFollowersCount(followed),
      following: this.getFollowingCount(followed)
    }).subscribe({
      next: ({ followers, following }) => {
        this.followUpdatedSubject.next({ followersCount: followers, followingCount: following });
      },
      error: (err) => {
        console.error('Error updating follow counts:', err);
      }
    });
  }

  getFollowers(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/followers`, { params: { username } })
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  getFollowing(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/following`, { params: { username } })
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  checkIfFollows(follower: string, followed: string): Observable<boolean> {
    const followRequest: FollowRequest = { follower, followed };
    return this.http.post<boolean>(`${this.apiUrl}/follow/check`, followRequest)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  getLastNFollowers(username: string, size: number): Observable<User[]> {
    const pageableRequest: PageableByStringRequest = { word: username, page: 0, size: size };
    return this.http.post<any>(`${this.apiUrl}/followers/last`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  getLastNFollowing(username: string, size: number): Observable<User[]> {
    const pageableRequest: PageableByStringRequest = { word: username, page: 0, size: size };
    return this.http.post<any>(`${this.apiUrl}/following/last`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  getFollowersCount(username: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/followers/count`, { params: { username } })
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  getFollowingCount(username: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/following/count`, { params: { username } })
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }
  getUsersNotFollowedBy(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/not-following`,  { params: { username } })
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }
}
