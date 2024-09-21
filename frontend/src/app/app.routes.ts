import {Routes} from '@angular/router';
import {LoginComponent} from "./component/login/login.component";
import {RegisterComponent} from "./component/register/register.component";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {ProfileComponent} from "./component/profile/profile.component";
import {CreateProfileComponent} from "./component/create-profile/create-profile.component";
import {AuthGuard} from "./guard/auth-guard";
import {LoggedInGuard} from "./guard/logged-in-guard";
import {ExplorePageComponent} from "./component/explore-page/explore-page.component";
import {PostDetailsComponent} from "./component/post-details/post-details.component";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'explore/:tag',
    component: ExplorePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explore',
    component: ExplorePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'create-profile',
    component: CreateProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user-profile/:username',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'post/:postId',
    component: PostDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
