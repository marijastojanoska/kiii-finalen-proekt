import {Component, Input, OnInit} from '@angular/core';
import {Post} from '../../model/entity/Post';
import {PostService} from '../../service/post.service';
import {AuthService} from '../../service/auth.service';
import {of, switchMap} from 'rxjs';
import {NgFor, NgIf} from '@angular/common';
import {PostComponent} from '../post/post.component';
import {SearchService} from '../../service/search.service';
import {LoggedInUserService} from "../../service/logged-in-user.service";
import {catchError} from "rxjs/operators";

@Component({
    selector: 'all-posts',
    standalone: true,
    imports: [NgFor, NgIf, PostComponent],
    templateUrl: './all-posts.component.html',
    styleUrls: ['./all-posts.component.css']
})
export class AllPostsComponent implements OnInit {
    @Input() exploreMode: boolean = false;
    @Input() tag: string = "";
    @Input() user: string = "";
    posts: Post[] = [];
    loggedInUserUsername: string = '';
    size: number = 8;
    pageNumber: number = 0;

    constructor(
        private postService: PostService,
        private authService: AuthService,
        private searchService: SearchService,
        private loggedInUserService: LoggedInUserService
    ) {
    }

    ngOnInit(): void {
      this.loggedInUserService.user$.pipe(
        switchMap(user => {
          if (!user || !user.username) {
            return of([]);
          }
          this.loggedInUserUsername = user.username;
          return this.loadPosts();
        }),
        catchError(() => {
          return of([]);
        })
      ).subscribe({
        next: (posts: Post[]) => {
          this.posts = this.sortPostsByDate(posts);
        },
        error: (err) => {
          console.error('Error loading posts:', err);
          this.posts = [];
        }
      });



      this.postService.postCreated$.subscribe(post => {
            this.posts.push(post);
            this.posts = this.sortPostsByDate(this.posts);
        });

        this.postService.postUpdated$.subscribe(updatedPost => {
            this.posts = this.posts.map(post => post.id === updatedPost.id ? updatedPost : post);
            this.posts = this.sortPostsByDate(this.posts);
        });

        this.postService.postDeleted$.subscribe(deletedPostId => {
            this.posts = this.posts.filter(post => post.id !== deletedPostId);
        });
    }

    loadMore(): void {
        this.pageNumber += 1;
        this.loadPosts().subscribe(posts => {
            this.posts = this.sortPostsByDate(this.posts.concat(posts));
        });
    }

    private loadPosts() {
        if (this.exploreMode) {
            return this.postService.getLatestPostsFromNonFollowedUsers(this.loggedInUserUsername, this.size, this.pageNumber);
        } else if (this.tag !== "") {
            return this.searchService.searchByTag(this.tag, this.size);
        } else if (this.user !== "") {
            return this.postService.getPageablePostsByUser(this.user,this.pageNumber);
        } else {
            return this.postService.getPostsOfFollowingForUser(this.loggedInUserUsername, this.size, this.pageNumber);
        }
    }

    private sortPostsByDate(posts: Post[]): Post[] {
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
}
