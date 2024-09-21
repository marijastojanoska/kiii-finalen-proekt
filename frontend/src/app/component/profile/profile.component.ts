import {Component, OnInit} from '@angular/core';
import {UserProfileService} from '../../service/user-profile.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FollowService} from '../../service/follow.service';
import {distinctUntilChanged, forkJoin, of, switchMap} from 'rxjs';
import {UserProfile} from '../../model/entity/UserProfile';
import {PostService} from '../../service/post.service';
import {Post} from '../../model/entity/Post';
import {PostComponent} from '../post/post.component';
import {CommentService} from '../../service/comment.service';
import {ReactionService} from '../../service/reaction.service';
import {FollowListComponent} from '../follow-list/follow-list.component';
import {DatePipe, NgFor, NgIf} from '@angular/common';
import {AllPostsComponent} from '../all-posts/all-posts.component';
import {NavbarComponent} from '../navbar/navbar.component';
import {UserProfileComponent} from '../user-profile/user-profile.component';
import {LoggedInUserService} from '../../service/logged-in-user.service';
import {DeactivatedUserComponent} from "../deactivated-user/deactivated-user.component";
import {map} from "rxjs/operators";

@Component({
  selector: 'profile',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, PostComponent, FollowListComponent, AllPostsComponent, NavbarComponent, UserProfileComponent, DatePipe, DeactivatedUserComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | undefined;
  targetUsername: string = '';
  loggedInUserUsername: string = '';
  isFollowing: boolean = false;
  posts: Post[] = [];
  following: number = 0;
  followers: number = 0;
  page: number = 0;
  postNumber: number = 0;

  constructor(
    private userProfileService: UserProfileService,
    private postService: PostService,
    private commentService: CommentService,
    private reactionService: ReactionService,
    private route: ActivatedRoute,
    private followService: FollowService,
    private loggedInUserService: LoggedInUserService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('username') || ''),
      distinctUntilChanged(),
      switchMap(username => {
        this.targetUsername = username;
        return this.loggedInUserService.user$;
      }),
      switchMap(user => {
        this.loggedInUserUsername = user?.username || '';
        return this.loadUserData();
      })
    ).subscribe();


    this.postService.postCreated$.subscribe(post => this.posts.push(post));
    this.postService.postUpdated$.subscribe(updatedPost => {
      this.posts = this.posts.map(post => post.id === updatedPost.id ? updatedPost : post);
    });
    this.postService.postDeleted$.subscribe(deletedPostId => {
      this.posts = this.posts.filter(post => post.id !== deletedPostId);
    });

    this.commentService.commentCreated$.subscribe(() => this.loadUserData());
    this.commentService.commentUpdated$.subscribe(() => this.loadUserData());
    this.commentService.commentDeleted$.subscribe(() => this.loadUserData());

    this.reactionService.reactionCreated$.subscribe(() => this.loadUserData());
    this.reactionService.reactionDeleted$.subscribe(() => this.loadUserData());

    this.followService.followUpdated$.subscribe(({followersCount, followingCount}) => {
      this.followers = followersCount;
      this.following = followingCount;
    });
  }

  loadUserData() {
    this.posts = [];
    return forkJoin({
      posts: this.postService.getPageablePostsByUser(this.targetUsername, this.page),
      allPosts: this.postService.getAllPostsByUser(this.targetUsername),
      followers: this.followService.getFollowersCount(this.targetUsername),
      following: this.followService.getFollowingCount(this.targetUsername),
      profile: this.userProfileService.getUserProfileByUsername(this.targetUsername),
      followingStatus: this.followService.checkIfFollows(this.loggedInUserUsername, this.targetUsername)
    }).pipe(
      switchMap(({posts, following, followers, profile, followingStatus, allPosts}) => {
        this.posts = posts;
        this.followers = followers;
        this.following = following;
        this.userProfile = profile;
        this.isFollowing = followingStatus;
        this.postNumber = allPosts.length
        return of(null);
      })
    );
  }

  followUser(): void {
    if (this.loggedInUserUsername && this.targetUsername) {
      this.followService.follow(this.loggedInUserUsername, this.targetUsername).subscribe({
        next: () => {
          this.isFollowing = true;
        },
        error: err => console.error('Error following user:', err.message)
      });
    }
  }

  unfollowUser(): void {
    if (this.loggedInUserUsername && this.targetUsername) {
      this.followService.unfollow(this.loggedInUserUsername, this.targetUsername).subscribe({
        next: () => {
          this.isFollowing = false;
        },
        error: err => console.error('Error unfollowing user:', err.message)
      });
    }
  }
}
