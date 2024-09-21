import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const excludedUrls = ['/api/auth/login', '/api/auth/register'];

  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const jwt = sessionStorage.getItem('token');

  if (jwt && jwt.length > 0) {
    const newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    });
    return next(newReq);
  }
  return next(req);
};

