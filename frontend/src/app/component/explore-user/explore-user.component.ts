import {Component, OnInit} from '@angular/core';
import {User} from "../../model/entity/User";
import {FollowService} from '../../service/follow.service';
import {NgForOf, NgIf} from "@angular/common";
import {UserDisplayComponent} from "../user-display/user-display.component";
import {catchError, of, switchMap} from 'rxjs';
import {LoggedInUserService} from "../../service/logged-in-user.service";

@Component({
  selector: 'explore-user',
  standalone: true,
  imports: [NgIf, UserDisplayComponent, NgForOf],
  templateUrl: './explore-user.component.html',
  styleUrls: ['./explore-user.component.css']
})
export class ExploreUserComponent implements OnInit {
  loggedInUserUsername: string = '';
  users: User[] = [];
  tag: string = "";

  constructor(
    private followService: FollowService,
    private loggedInUserService: LoggedInUserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loggedInUserService.user$.pipe(
      switchMap(user => {
        this.loggedInUserUsername = user?.username || '';
        if (!this.loggedInUserUsername) {
          return of([]);
        }
        return this.followService.getUsersNotFollowedBy(this.loggedInUserUsername).pipe(
          catchError(error => {
            console.error('Error loading users:', error);
            return of([]);
          })
        );
      })
    ).subscribe(users => {
      this.users = this.getRandomUsers(users, 5);
    });
  }


  getRandomUsers(users: User[], count: number): User[] {
    const shuffled = users.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}
