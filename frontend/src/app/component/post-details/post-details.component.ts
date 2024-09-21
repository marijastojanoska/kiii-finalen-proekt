import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../model/entity/Post';
import { PostService } from '../../service/post.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {PostComponent} from "../post/post.component";
import {NgIf} from "@angular/common";
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
  selector: 'post-details',
  standalone: true,
  templateUrl: './post-details.component.html',
  imports: [
    PostComponent,
    NgIf,
    NavbarComponent
  ],
  styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent implements OnInit {

  postId: number | null = null;
  post: Post | null = null;

  constructor(private route: ActivatedRoute,
              private postService: PostService) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.postId = parseInt(params.get('postId') || '', 10);
        if (isNaN(this.postId)) {
          return of(null);
        }
        return this.postService.getPostById(this.postId);
      })
    ).subscribe(post => this.post = post);
  }
}
