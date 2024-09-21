import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {PostService} from '../../service/post.service';
import {AuthService} from '../../service/auth.service';
import {ImageService} from '../../service/image.service';
import {PostRequest} from '../../model/request/PostRequest';
import {FormsModule} from '@angular/forms';
import {NgIf} from "@angular/common";
import {User} from "../../model/entity/User";
import {UserService} from '../../service/user.service';
import {Post} from '../../model/entity/Post';
import {ConfirmActionComponent} from "../confirm-action/confirm-action.component";
import {Router} from "@angular/router";
import {LoggedInUserService} from "../../service/logged-in-user.service";

@Component({
    selector: 'create-post',
    standalone: true,
    imports: [FormsModule, NgIf, ConfirmActionComponent],
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
    @Input() post?: Post;
    content: string = '';
    selectedImage: File | null = null;
    loggedInUser?: User;
    @Input() showModal: boolean = false;
    currentImagePreview: string | ArrayBuffer | null = null;
    originalImagePreview: string | ArrayBuffer | null = null;
    showConfirmDialog: boolean = false;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        private postService: PostService,
        private imageService: ImageService,
        private router: Router,
        private loggedInUserService: LoggedInUserService,
    ) {
    }

    ngOnInit(): void {
        this.loggedInUserService.user$.subscribe(user => this.loggedInUser = user!);
        if (this.post) {
            this.content = this.post.content;
            if (this.post.image) {
                this.originalImagePreview = `data:image/png;base64,${this.post.image?.image}`;
                this.currentImagePreview = this.originalImagePreview;
            }
        }
    }

    submitPost(): void {
        this.showConfirmDialog = true;
    }

    confirmPost(): void {
        this.showConfirmDialog = false;
        if (this.selectedImage) {
            this.uploadImageAndSavePost();
        } else {
            this.savePost();
        }
        this.router.navigate(['/user-profile/', this.loggedInUser?.username]).then(() => {
        });
    }

    cancelConfirm(): void {
        this.showConfirmDialog = false;
    }


    onFileSelected(event: any): void {
        this.selectedImage = event.target.files[0];
        if (this.selectedImage) {
            const reader = new FileReader();
            reader.onload = (e) => this.currentImagePreview = e.target?.result as string | ArrayBuffer;
            reader.readAsDataURL(this.selectedImage);
        }
    }

    uploadImageAndSavePost(): void {
        if (this.selectedImage) {
            this.imageService.uploadImage(this.selectedImage).subscribe({
                next: (imageId) => this.savePost(imageId.id),
                error: (err) => console.error('Error uploading image:', err)
            });
        }
    }

    savePost(imageId?: number): void {
        const postRequest: PostRequest = {
            username: this.loggedInUser!.username,
            content: this.content,
            imageId: imageId
        };

        if (this.post) {
            this.postService.updatePost(this.post.id, postRequest).subscribe({
                next: () => {
                    this.resetForm();
                },
                error: (err) => console.error('Error updating post:', err)
            });
        } else {
            this.postService.createPost(postRequest).subscribe({
                next: () => {
                    this.resetForm();
                },
                error: (err) => console.error('Error creating post:', err)
            });
        }
    }

    resetForm(): void {
        this.content = '';
        this.selectedImage = null;
        this.currentImagePreview = null;
        this.originalImagePreview = null;
        this.showModal = false;
    }

    closeModal(): void {
        this.showModal = false;
        this.currentImagePreview = this.originalImagePreview;
        this.selectedImage = null;
    }

    deleteCurrentImage(): void {
        this.selectedImage = null;
        this.currentImagePreview = this.originalImagePreview;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    deleteImage(): void {
        if (this.post?.image?.id) {
            this.imageService.deleteImage(this.post.image.id).subscribe({
                next: () => {
                    this.currentImagePreview = null;
                    this.originalImagePreview = null;
                    if (this.fileInput) {
                        this.fileInput.nativeElement.value = '';
                    }
                },
                error: (err) => console.error('Error deleting image:', err)
            });
        } else {
            this.currentImagePreview = null;
            this.selectedImage = null;
            if (this.fileInput) {
                this.fileInput.nativeElement.value = '';
            }
        }
    }
}
