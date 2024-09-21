import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { catchError, distinct, map, tap } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';
import { Post } from '../model/entity/Post';
import { PostRequest } from '../model/request/PostRequest';
import { PageableByStringRequest } from '../model/request/PageableByStringRequest';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = 'http://localhost:8080/api/posts';
  private postCreatedSubject = new Subject<Post>();
  private postUpdatedSubject = new Subject<Post>();
  private postDeletedSubject = new Subject<number>();

  postCreated$ = this.postCreatedSubject.asObservable();
  postUpdated$ = this.postUpdatedSubject.asObservable();
  postDeleted$ = this.postDeletedSubject.asObservable();

  constructor(private http: HttpClient, private errorHandlingService: ErrorHandlingService) {}

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  createPost(postRequest: PostRequest): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, postRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(post => this.postCreatedSubject.next(post))
      );
  }

  updatePost(id: number, postRequest: PostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, postRequest)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(post => this.postUpdatedSubject.next(post))
      );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.postDeletedSubject.next(id))
      );
  }

  getPostsOfFollowingForUser(username: string,size:number, page:number): Observable<any> {
    const pageableRequest: PageableByStringRequest = { word: username, page: page, size: size };
    return this.http.post<any>(`${this.apiUrl}/following/last`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error)));
  }

  getLatestPostsFromNonFollowedUsers(username: string, size: number,page:number): Observable<any> {
    const pageableRequest: PageableByStringRequest = { word: username, page: page, size: size };
    return this.http.post<any>(`${this.apiUrl}/non-followed`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }
  searchPostsByTag(tag: string): Observable<Post[]> {
    const params = new HttpParams().set('tag', tag);
    return this.http.get<Post[]>(`${this.apiUrl}/search-by-tag`, { params })
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  searchPostsByTagPageable(username: string, size: number): Observable<any> {
    const pageableRequest: PageableByStringRequest = { word: username, page:0, size: size };
    return this.http.post<any>(`${this.apiUrl}/search-by-tag/pageable`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  getPageablePostsByUser(username: string, page:number): Observable<any> {
    const pageableRequest: PageableByStringRequest = { word: username, page: page, size: 3 };
    return this.http.post<any>(`${this.apiUrl}/search-by-user/pageable`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      );
  }

  getAllPostsByUser(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${username}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }


}
