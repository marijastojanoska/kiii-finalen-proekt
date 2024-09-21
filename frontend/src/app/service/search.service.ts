import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, forkJoin, map, Observable} from "rxjs";
import {User} from "../model/entity/User";
import {PageableByStringRequest} from "../model/request/PageableByStringRequest";
import {ErrorHandlingService} from './error-handling.service';
import {Post} from '../model/entity/Post';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient,
              private errorHandlingService: ErrorHandlingService) {
  }

  searchByUsername(username: string, size: number): Observable<User[]> {
    const pageableRequest: PageableByStringRequest = {word: username, page: 0, size: size};
    return this.http.post<any>(`${this.apiUrl}/users/search-by-username/pageable`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      )
  }

  searchByTag(tag: string, size: number): Observable<Post[]> {
    const pageableRequest: PageableByStringRequest = {word: tag, page: 0, size: size};
    return this.http.post<any>(`${this.apiUrl}/posts/search-by-tag/pageable`, pageableRequest)
      .pipe(
        map(response => response.content),
        catchError(error => this.errorHandlingService.handleError(error))
      )
  }

  searchByQuery(query: string, userSize: number, postSize: number): Observable<{ users: User[], posts: Post[] }> {
    return forkJoin({
      users: this.searchByUsername(query, userSize),
      posts: this.searchByTag(query, postSize)
    });
  }


}
