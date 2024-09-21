import {Component, Input} from '@angular/core';
import {NgFor, NgIf} from "@angular/common";
import {AllNotificationsComponent} from "../all-notifications/all-notifications.component";
import {AllPostsComponent} from "../all-posts/all-posts.component";
import {ProfileComponent} from "../profile/profile.component";
import {UserProfileComponent} from "../user-profile/user-profile.component";
import {CreatePostComponent} from "../create-post/create-post.component";
import {SearchComponent} from "../search/search.component";
import {NavbarComponent} from "../navbar/navbar.component";
import {RouterOutlet} from "@angular/router";
import {ExploreUserComponent} from "../explore-user/explore-user.component";

@Component({
    selector: 'dashboard',
    standalone: true,
  imports: [NgIf, NgFor, NavbarComponent, AllNotificationsComponent, AllPostsComponent, ProfileComponent, UserProfileComponent, CreatePostComponent, SearchComponent, RouterOutlet, ExploreUserComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  showModal: boolean = false;

  openModal(): void {
    this.showModal = true;
  }


}
