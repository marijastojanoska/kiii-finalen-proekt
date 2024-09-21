import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ErrorHandlingService} from './error-handling.service';
import {Image} from "../model/entity/Image";

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = 'http://localhost:8080/api/images';
  private imageUploadedSubject = new Subject<any>();
  private imageDeletedSubject = new Subject<number>();

  imageUploaded$ = this.imageUploadedSubject.asObservable();
  imageDeleted$ = this.imageDeletedSubject.asObservable();

  constructor(private http: HttpClient, private errorHandlingService: ErrorHandlingService) {
  }

  uploadImage(image: File): Observable<Image> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<Image>(`${this.apiUrl}`, formData)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(response => this.imageUploadedSubject.next(response))
      );
  }

  getImageById(imageId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${imageId}`)
      .pipe(catchError(error => this.errorHandlingService.handleError(error)));
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${imageId}`)
      .pipe(
        catchError(error => this.errorHandlingService.handleError(error)),
        tap(() => this.imageDeletedSubject.next(imageId))
      );
  }
}
