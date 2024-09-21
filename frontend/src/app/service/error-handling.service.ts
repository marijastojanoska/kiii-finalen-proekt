import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = `Error: ${error.error.message}`;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = `Error: ${error.error}`;
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }

    console.error('Error:', errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}
