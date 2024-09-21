import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideZoneChangeDetection} from "@angular/core";
import {provideRouter} from "@angular/router";
import {routes} from "./app/app.routes";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {authInterceptor} from "./app/interceptor/auth.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
