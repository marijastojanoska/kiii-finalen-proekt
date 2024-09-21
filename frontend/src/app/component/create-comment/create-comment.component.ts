import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommentService} from '../../service/comment.service';
import {AuthService} from '../../service/auth.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {ConfirmActionComponent} from "../confirm-action/confirm-action.component";
import {User} from '../../model/entity/User';
import {LoggedInUserService} from "../../service/logged-in-user.service";

@Component({
    selector: 'create-comment',
    standalone: true,
    imports: [FormsModule, NgIf, ConfirmActionComponent],
    templateUrl: './create-comment.component.html',
    styleUrls: ['./create-comment.component.css']
})
export class CreateCommentComponent implements OnInit {
    @Input() postId!: number;
    @Input() parentId?: number;
    @Input() commentId?: number;
    @Input() showComponent: boolean = false;
    @Output() formClosed = new EventEmitter<void>();
    commentContent: string = '';
    loggedInUser!: User;
    loggedInUserUsername: string = '';
    showConfirmDialog: boolean = false;

    constructor(
        private commentService: CommentService,
        private authService: AuthService,
        private loggedInUserService: LoggedInUserService,
    ) {
    }

    ngOnInit(): void {
        this.loggedInUserService.user$.subscribe(user => this.loggedInUserUsername = user?.username!);
        this.loggedInUserService.user$.subscribe(user => this.loggedInUser = user!);
        if (this.commentId) {
            this.commentService.getCommentById(this.commentId).subscribe({
                next: (comment) => this.commentContent = comment.content,
                error: (err) => console.error('Error fetching comment:', err)
            });
        }
    }

    submitComment(): void {
        this.showConfirmDialog = true;
    }

    confirmSubmit(): void {
        if (this.commentContent.trim()) {
            if (this.commentId) {
                this.commentService.updateComment(this.commentId, this.commentContent.trim()).subscribe({
                    next: () => {
                        this.commentContent = '';
                        this.showComponent = false;
                        this.formClosed.emit();
                    },
                    error: (err) => console.error('Error updating comment:', err)
                });
            } else {
                this.commentService.createComment(
                    this.loggedInUserUsername,
                    this.postId,
                    this.commentContent.trim(),
                    this.parentId
                ).subscribe({
                    next: () => {
                        this.commentContent = '';
                        this.showComponent = false;
                        this.formClosed.emit();
                    },
                    error: (err) => console.error('Error creating comment:', err)
                });
            }
        }
        this.showConfirmDialog = false;
    }
  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.submitComment();
    }
  }


    cancel(): void {
        this.showComponent = false;
        this.formClosed.emit();
    }

    cancelConfirm(): void {
        this.showConfirmDialog = false;
    }

}
