import { Component, Input, OnInit } from '@angular/core';
import { User } from "../../model/entity/User";
import { FollowService } from '../../service/follow.service';
import { AuthService } from '../../service/auth.service';
import { NgForOf, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { UserDisplayComponent } from "../user-display/user-display.component";
import { LoggedInUserService } from "../../service/logged-in-user.service";
import { switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'follow-list',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, UserDisplayComponent],
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.css']
})
export class FollowListComponent implements OnInit {
  @Input() isFollowersList: boolean = true;
  @Input() username: string = '';
  followList: User[] = [];
  loggedInUserUsername: string = '';
  size: number = 5;

  constructor(
    private followService: FollowService,
    private authService: AuthService,
    private loggedInUserService: LoggedInUserService
  ) {}

  ngOnInit(): void {
    this.loggedInUserService.user$.pipe(
      switchMap(user => {
        this.loggedInUserUsername = user?.username || '';
        return this.loadFollowList();
      }),
      catchError(err => {
        return of([]);
      })
    ).subscribe(followList => {
      this.followList = followList;
    });
  }

  loadMore(): void {
    this.size += 5;
    this.loadFollowList().subscribe(followList => {
      this.followList = followList;
    });
  }

  loadLess(): void {
    this.size -= 5;
    this.loadFollowList().subscribe(followList => {
      this.followList = followList;
    });
  }

  loadFollowList() {
    if (this.isFollowersList) {
      return this.followService.getLastNFollowers(this.loggedInUserUsername, this.size).pipe(
        catchError(err => {
          return of([]);
        })
      );
    } else {
      return this.followService.getLastNFollowing(this.loggedInUserUsername, this.size).pipe(
        catchError(err => {
          return of([]);
        })
      );
    }
  }
}
