import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, Subject} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Comment} from '../model/entity/Comment';
import {CommentRequest} from '../model/request/CommentRequest';
import {PageableByLongRequest} from '../model/request/PageableByLongRequest';
import {ErrorHandlingService} from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly apiUrl = '/api/comments';
  private commentCreatedSubject = new Subject<Comment>();
  private commentUpdatedSubject = new Subject<Comment>();
  private commentDeletedSubject = new Subject<number>();

  commentCreated$ = this.commentCreatedSubject.asObservable();
  commentUpdated$ = this.commentUpdatedSubject.asObservable();
  commentDeleted$ = this.commentDeletedSubject.asObservable();

  constructor(private http: HttpClient, private errorHandlingService: ErrorHandlingService) {}

  getCommentById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  createComment(username: string, postId: number, content: string, parentId?: number): Observable<Comment> {
    const commentRequest: CommentRequest = {username, postId, parentId, content};
    return this.http.post<Comment>(this.apiUrl, commentRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(comment => this.commentCreatedSubject.next(comment))
      );
  }

  updateComment(id: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, content)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(comment => this.commentUpdatedSubject.next(comment))
      );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.commentDeletedSubject.next(id))
      );
  }

  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  getCommentsByPostPageable(id: number, size: number): Observable<Comment[]> {
    const pageableByLongRequest: PageableByLongRequest = {id: id, page: 0, size: size};
    return this.http.post<any>(`${this.apiUrl}/get-by-post/pageable`, pageableByLongRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  getCommentsByParentId(id: number, size: number): Observable<Comment[]> {
    const pageableByLongRequest: PageableByLongRequest = {id: id, page: 0, size: size};
    return this.http.post<any>(`${this.apiUrl}/get-by-parent/pageable`, pageableByLongRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }
}
