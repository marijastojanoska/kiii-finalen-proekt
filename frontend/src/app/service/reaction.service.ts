import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ErrorHandlingService} from './error-handling.service';
import {catchError, Observable, Subject, tap} from 'rxjs';
import {Reaction} from '../model/entity/Reaction';
import {ReactionRequest} from '../model/request/ReactionRequest';
import {ReactionTypeResponse} from '../model/response/ReactionTypeResponse';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  private readonly apiUrl = 'http://localhost:8080/api/reactions';

  private reactionCreatedSubject = new Subject<Reaction>();
  private reactionDeletedSubject = new Subject<number>();

  reactionCreated$ = this.reactionCreatedSubject.asObservable();
  reactionDeleted$ = this.reactionDeletedSubject.asObservable();

  constructor(private http: HttpClient,
              private errorHandlingService: ErrorHandlingService) {
  }

  getReactionsByPost(postId: number): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.apiUrl}/post/${postId}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  createReaction(postId: number, username: string, type: string): Observable<Reaction> {
    const reactionRequest = {
      postId: postId,
      username: username,
      type: type
    };
    return this.http.post<Reaction>(this.apiUrl, reactionRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(reaction => this.reactionCreatedSubject.next(reaction))
      );
  }

  deleteReaction(reactionId: number, username: string): Observable<void> {
    const params = new HttpParams().set('username', username);
    return this.http.delete<void>(`${this.apiUrl}/${reactionId}`, {params})
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.reactionDeletedSubject.next(reactionId))
      );
  }

  getReactionTypes(): Observable<ReactionTypeResponse[]> {
    return this.http.get<ReactionTypeResponse[]>(`${this.apiUrl}/types`);
  }

  getAllByType(postId:number, type: string): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.apiUrl}/post/${postId}/type/${type}`)
  }
}
