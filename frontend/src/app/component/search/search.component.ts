import { Component, OnInit } from '@angular/core';
import { User } from "../../model/entity/User";
import { Post } from "../../model/entity/Post";
import { SearchService } from '../../service/search.service';
import { FormsModule } from "@angular/forms";
import { NgForOf, NgIf } from "@angular/common";
import { BehaviorSubject, debounceTime, distinctUntilChanged, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { PostComponent } from "../post/post.component";
import { RouterLink } from "@angular/router";
import { UserDisplayComponent } from "../user-display/user-display.component";

@Component({
  selector: 'search',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf, PostComponent, RouterLink, UserDisplayComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  query: string = '';
  users: User[] = [];
  posts: Post[] = [];
  private searchSubject$ = new BehaviorSubject<string>('');
  userSize: number = 3;
  postSize: number = 3;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchQuery();
  }

  searchQuery() {
    this.searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length > 0) {
            return this.searchService.searchByQuery(query, this.userSize, this.postSize);
          } else {
            return of({ users: [], posts: [] });
          }
        })
      )
      .subscribe((result) => {
        this.users = result.users;
        this.posts = result.posts;
      });
  }

  onSearch(query: string): void {
    this.searchSubject$.next(query);
    this.userSize = 3;
    this.postSize = 3;
  }

  clearSearch(): void {
    this.query = '';
    this.onSearch(this.query);
  }

  loadMoreUsers(): void {
    this.userSize += 3;
    this.searchQuery();
  }

  loadLessUsers(): void {
    if (this.userSize > 3) {
      this.userSize -= 3;
      this.searchQuery();
    }
  }

  loadMorePosts(): void {
    this.postSize += 3;
    this.searchQuery();
  }

  loadLessPosts(): void {
    if (this.postSize > 3) {
      this.postSize -= 3;
      this.searchQuery();
    }
  }
}
