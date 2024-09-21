import {Component, Input, OnInit} from '@angular/core';
import {ReactionService} from '../../service/reaction.service';
import {Post} from '../../model/entity/Post';
import {CommentService} from '../../service/comment.service';
import {PostService} from '../../service/post.service';
import {AuthService} from '../../service/auth.service';
import {AllCommentsComponent} from '../all-comments/all-comments.component';
import {CreateCommentComponent} from '../create-comment/create-comment.component';
import {ReactionComponent} from '../reaction/reaction.component';
import {CreatePostComponent} from '../create-post/create-post.component';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {ConfirmActionComponent} from "../confirm-action/confirm-action.component";
import {Router, RouterLink} from "@angular/router";
import {Reaction} from "../../model/entity/Reaction";
import {Comment} from "../../model/entity/Comment";
import {LoggedInUserService} from "../../service/logged-in-user.service";

@Component({
    selector: 'post',
    standalone: true,
    imports: [AllCommentsComponent, CreateCommentComponent, ReactionComponent, CreatePostComponent, NgIf, NgForOf, ConfirmActionComponent, RouterLink, DatePipe],
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
    @Input() post!: Post;
    reactionCounts: number = 0;
    commentCounts: number = 0;
    reactions: Reaction[] = []
    comments: Comment[] = []
    loggedInUserUsername: string = '';
    editing: boolean = false;
    canEditOrDelete: boolean = false;
    showConfirmDialog: boolean = false;
    @Input() hideOnSearch: boolean = false;


    constructor(
        private reactionService: ReactionService,
        private commentService: CommentService,
        private postService: PostService,
        private authService: AuthService,
        private router: Router,
        private loggedInUserService: LoggedInUserService
    ) {
    }

    ngOnInit(): void {

        this.loggedInUserService.user$.subscribe(user => {
            this.loggedInUserUsername = user?.username!;
            this.checkEditOrDeletePermission();
            this.loadReactionCounts();
            this.loadCommentCounts();
        });


        this.commentService.commentCreated$.subscribe({
            next: (comment) => {
                this.comments.push(comment)
                this.commentCounts = this.comments.length;
            },
            error: (err) => console.error(err)
        });

        this.commentService.commentDeleted$.subscribe({
                next: (commentId) => {
                    this.comments = this.comments.filter((comment) => comment.id != commentId)
                    this.commentCounts = this.comments.length;
                },
                error: (err) => console.error(err)
            }
        );

        this.reactionService.reactionCreated$.subscribe({
                next: (reaction) => {
                    const existingReactionIndex = this.reactions.findIndex(r => r.id === reaction.id);
                    if (existingReactionIndex !== -1) {
                        this.reactions[existingReactionIndex] = reaction;
                    } else {
                        this.reactions.push(reaction);
                    }
                    this.reactionCounts = this.reactions.length;
                },
                error: (err) => console.error(err)
            }
        );

        this.reactionService.reactionDeleted$.subscribe({
                next: (reactionId) => {
                    this.reactions = this.reactions.filter((reaction) => reaction.id != reactionId)
                    this.reactionCounts = this.reactions.length;
                },
                error: (err) => console.error(err)
            }
        );

    }

    loadReactionCounts(): void {
        this.reactionService.getReactionsByPost(this.post.id).subscribe({
            next: (reactions) => {
                this.reactions = reactions;
                this.reactionCounts = reactions.length;
            },
            error: (err) => console.error('Error fetching reactions:', err)
        });
    }

    loadCommentCounts(): void {
        this.commentService.getCommentsByPost(this.post.id).subscribe({
            next: (comments) => {
                this.comments = comments;
                this.commentCounts = comments.length;
            },
            error: (err) => console.error('Error fetching comments:', err)
        });
    }

    editToggle(): void {
        this.editing = !this.editing;
    }

    deletePost(): void {
        this.showConfirmDialog = true;
    }

    confirmDelete(): void {
        this.postService.deletePost(this.post.id).subscribe({
            error: (err) => console.error('Error deleting post:', err)
        });
    }

    cancelDelete(): void {
        this.showConfirmDialog = false;
    }

    private checkEditOrDeletePermission(): void {
        this.canEditOrDelete = this.loggedInUserUsername === this.post.user.username;
    }
}
