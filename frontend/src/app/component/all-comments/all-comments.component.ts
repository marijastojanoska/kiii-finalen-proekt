import {Component, Input, OnInit} from '@angular/core';
import {CommentService} from '../../service/comment.service';
import {Comment} from '../../model/entity/Comment';
import {AuthService} from '../../service/auth.service';
import {DatePipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {CreateCommentComponent} from "../create-comment/create-comment.component";
import {FormsModule} from "@angular/forms";
import {LoggedInUserService} from "../../service/logged-in-user.service";

@Component({
    selector: 'all-comments',
    standalone: true,
    imports: [DatePipe, NgForOf, NgIf, NgStyle, CreateCommentComponent, FormsModule],
    templateUrl: './all-comments.component.html',
    styleUrls: ['./all-comments.component.css']
})
export class AllCommentsComponent implements OnInit {
    @Input() postId?: number;
    comments: Comment[] = [];
    replies: Map<number, { isVisible: boolean, comments: Comment[] }> = new Map();
    activeComment: { id?: number, type: 'add' | 'reply' | 'edit' } = {id: undefined, type: 'add'};
    loggedInUserUsername: string = '';
    showCreateComment: boolean = false;
    showComments: boolean = false;
    commentCounts: number = 0;
    size: number = 3;


    constructor(
        private commentService: CommentService,
        private authService: AuthService,
        private loggedInUserService: LoggedInUserService,
    ) {
    }

    ngOnInit(): void {
        this.loggedInUserService.user$.subscribe(user => {
            this.loggedInUserUsername = user?.username!;
            this.loadTopLevelComments();
            this.loadCommentCounts();
            this.populateRepliesMap();
        });


        this.commentService.commentCreated$.subscribe({
            next: (comment) => {
                this.handleCommentCreated(comment);
                this.loadCommentCounts();
            },
            error: (err) => console.error('Error handling created comment:', err)
        });

        this.commentService.commentUpdated$.subscribe({
            next: (updatedComment) => this.handleCommentUpdated(updatedComment),
            error: (err) => console.error('Error handling updated comment:', err)
        });

        this.commentService.commentDeleted$.subscribe({
            next: (commentId) => {
                this.handleCommentDeleted(commentId);
                this.loadCommentCounts();
            },
            error: (err) => console.error('Error handling deleted comment:', err)
        });
    }

    loadMore(): void {
        this.size += 3;
        this.loadTopLevelComments();
    }

    loadLess(): void {
        if (this.size <= 3) {
            this.size = 3;
            this.showComments = false;
        } else {
            this.size -= 3;
        }
        this.loadTopLevelComments();
    }

    loadCommentCounts(): void {
        this.commentService.getCommentsByPost(this.postId!).subscribe({
            next: (comments) => {
                this.commentCounts = comments.length;
            },
            error: (err) => console.error('Error fetching comments:', err)
        });
    }


    loadTopLevelComments(): void {
        if (this.postId !== undefined) {
            this.commentService.getCommentsByPostPageable(this.postId, this.size).subscribe({
                next: (comments) => {
                    this.comments = comments.filter(comment => !comment.parent);
                },
                error: (err) => console.error('Error loading top-level comments:', err)
            });
        }
    }

    populateRepliesMap(): void {
        if (this.postId !== undefined) {
            this.commentService.getCommentsByPost(this.postId).subscribe({
                next: (comments) => {
                    comments.forEach(comment => {
                        if (comment.parent) {
                            const parentReplies = this.replies.get(comment.parent.id)?.comments || [];
                            parentReplies.push(comment);
                            this.replies.set(comment.parent.id, {isVisible: false, comments: parentReplies});
                        }
                    });
                },
                error: (err) => console.error('Error loading all replies:', err)
            });
        }
    }

    showCommentForm(type: 'add' | 'reply' | 'edit', parentIdOrCommentId?: number): void {
        if (type === 'reply') {
            this.activeComment = {id: parentIdOrCommentId!, type};
        } else {
            this.activeComment = {id: undefined, type};
        }
        this.showCreateComment = true;
    }

    hideCommentForm(): void {
        this.showCreateComment = false;
        this.activeComment = {id: undefined, type: 'add'};
    }

    toggleReplies(commentId: number): void {
        const currentReplies = this.replies.get(commentId);
        if (currentReplies) {
            this.replies.set(commentId, {...currentReplies, isVisible: !currentReplies.isVisible});
        }
    }

    toggleComments(): void {
        this.showComments = !this.showComments;
    }

    canEditOrDelete(comment: Comment): boolean {
        return this.loggedInUserUsername === comment.user.username;
    }

    deleteComment(id: number): void {
        this.commentService.deleteComment(id).subscribe({
            error: (err) => console.error('Error deleting comment:', err)
        });
    }

    private handleCommentCreated(comment: Comment) {
        if (this.postId === comment.post.id) {
            if (comment.parent) {
                const replies = this.replies.get(comment.parent.id)?.comments || [];
                replies.push(comment);
                this.replies.set(comment.parent.id, {...this.replies.get(comment.parent.id)!, comments: replies});
            } else {
                this.comments.push(comment);
            }
            this.hideCommentForm();
        }
    }

    private handleCommentUpdated(updatedComment: Comment) {
        if (this.postId === updatedComment.post.id) {
            if (updatedComment.parent) {
                const replies = this.replies.get(updatedComment.parent.id)?.comments || [];
                const index = replies.findIndex(comment => comment.id === updatedComment.id);
                if (index !== -1) replies[index] = updatedComment;
            } else {
                const index = this.comments.findIndex(comment => comment.id === updatedComment.id);
                if (index !== -1) this.comments[index] = updatedComment;
            }
            this.hideCommentForm();
        }
    }

    private handleCommentDeleted(commentId: number) {
        this.comments = this.comments.filter(comment => comment.id !== commentId);
        if (this.replies.has(commentId)) {
            this.replies.delete(commentId);
        } else {
            this.replies.forEach((value, parentId) => {
                const filteredReplies = value.comments.filter(comment => comment.id !== commentId);
                if (filteredReplies.length > 0) {
                    this.replies.set(parentId, {...value, comments: filteredReplies});
                } else {
                    this.replies.delete(parentId);
                }
            });
        }
    }
}
