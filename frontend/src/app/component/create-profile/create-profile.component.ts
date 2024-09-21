import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {UserProfileService} from '../../service/user-profile.service';
import {UserProfileRequest} from '../../model/request/UserProfileRequest';
import {UserService} from '../../service/user.service';
import {AuthService} from '../../service/auth.service';
import {ImageService} from '../../service/image.service';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {NavbarComponent} from "../navbar/navbar.component";
import {NgClass, NgIf} from "@angular/common";
import {LoggedInUserService} from "../../service/logged-in-user.service";
import {User} from "../../model/entity/User";

@Component({
    selector: 'create-profile',
    templateUrl: './create-profile.component.html',
    styleUrls: ['./create-profile.component.css'],
    imports: [
        NavbarComponent,
        ReactiveFormsModule,
        NgClass,
        RouterLink,
        NgIf
    ],
    standalone: true
})
export class CreateProfileComponent implements OnInit {
    profileForm: FormGroup;
    accountForm: FormGroup;
    passwordForm: FormGroup;
    deactivateForm: FormGroup;
    errorMessage: string | null = null;
    loggedInUserUsername: string = '';
    loggedInUser!: User;
    selectedImage: File | null = null;
    currentProfilePictureUrl: string | null = null;
    originalProfilePictureUrl: string | null = null;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    changedFields: { [key: string]: boolean } = {};
    activeForm: string | null = null;


    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private userProfileService: UserProfileService,
        private imageService: ImageService,
        private router: Router,
        private authService: AuthService,
        private loggedInUserService: LoggedInUserService,
    ) {
        this.accountForm = this.fb.group({
            username: [{value: '', disabled: true}, Validators.required],
            email: ['', [Validators.required, Validators.email]],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required]
        });

        this.profileForm = this.fb.group({
            bio: [''],
            dateOfBirth: ['']
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.deactivateForm = this.fb.group({
            oldPasswordDeactivate: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loggedInUserService.user$.subscribe(user => this.loggedInUserUsername = user?.username!);
        this.loggedInUserService.user$.subscribe(user => {
            this.loggedInUser = user!;
            this.loadUserProfile()
        });

        this.trackChanges(this.profileForm);
        this.trackChanges(this.accountForm);
        this.trackChanges(this.passwordForm);
        this.trackChanges(this.deactivateForm);
    }

    trackChanges(form: FormGroup) {
        Object.keys(form.controls).forEach(key => {
            form.get(key)?.valueChanges.subscribe(() => {
                this.changedFields[key] = true;
            });
        });
    }

    hasChanged(field: string): boolean {
        return this.changedFields[field] || false;
    }

    loadUserProfile(): void {
        this.accountForm.patchValue({
            username: this.loggedInUser.username,
            email: this.loggedInUser.email,
            firstName: this.loggedInUser.firstName,
            lastName: this.loggedInUser.lastName
        });

        this.userProfileService.getUserProfileByUsername(this.loggedInUser.username).pipe(
            tap(profile => {
                this.profileForm.patchValue({
                    bio: profile.bio,
                    dateOfBirth: profile.dateOfBirth
                });

                if (profile.profilePicture) {
                    this.originalProfilePictureUrl = `data:image/png;base64,${profile.profilePicture.image}`;
                    this.currentProfilePictureUrl = this.originalProfilePictureUrl;
                }
            }),
            catchError(err => {
                this.errorMessage = 'Failed to load profile: ' + err.message;
                return of(null);
            })
        ).subscribe();
    }

    onFileSelected(event: any): void {
        this.selectedImage = event.target.files[0];
        if (this.selectedImage) {
            const reader = new FileReader();
            reader.onload = (e) => this.currentProfilePictureUrl = e.target?.result as string;
            reader.readAsDataURL(this.selectedImage);
        }
    }

    deleteCurrentImage(): void {
        if (this.selectedImage) {
            this.selectedImage = null;
            this.currentProfilePictureUrl = this.originalProfilePictureUrl;
            if (this.fileInput) {
                this.fileInput.nativeElement.value = '';
            }
        }
    }

    deleteProfilePicture(): void {
        if (this.currentProfilePictureUrl) {
            this.userProfileService.getUserProfileByUsername(this.loggedInUserUsername).pipe(
                switchMap(profile => this.imageService.deleteImage(profile.profilePicture.id))
            ).subscribe({
                next: () => {
                    this.currentProfilePictureUrl = null;
                    this.originalProfilePictureUrl = null;
                    if (this.fileInput) {
                        this.fileInput.nativeElement.value = '';
                    }
                },
                error: (err) => console.error('Error deleting profile picture:', err)
            });
        }
    }

    onUploadImage(): void {
        if (this.selectedImage && this.loggedInUserUsername) {
            this.imageService.uploadImage(this.selectedImage).pipe(
                switchMap(response => {
                    const userProfile: UserProfileRequest = {
                        username: this.loggedInUserUsername,
                        profilePictureId: response.id
                    };
                    return this.updateProfile(userProfile);
                })
            ).subscribe({
                next: () => {
                    this.selectedImage = null;
                    this.loadUserProfile();
                },
                error: (err) => {
                    this.errorMessage = 'Failed to upload image: ' + err.message;
                }
            });
        }
    }

    onSubmitProfile(): void {
        if (this.profileForm.valid && this.loggedInUserUsername) {
            const userProfile: UserProfileRequest = {
                username: this.loggedInUserUsername,
                ...this.profileForm.value
            };
            this.updateProfile(userProfile).subscribe({
                next: () => {
                    this.highlightChangedFields(this.profileForm);
                },
                error: (err) => {
                    this.errorMessage = 'Failed to update profile: ' + err.message;
                }
            });
        }
    }

    onSubmitAccount(): void {
        if (this.accountForm.valid && this.loggedInUserUsername) {
            const {email, firstName, lastName} = this.accountForm.value;
            this.userService.updateUser(this.loggedInUserUsername, undefined, undefined, undefined, email, firstName, lastName).subscribe({
                next: () => {
                    this.highlightChangedFields(this.accountForm);
                },
                error: (err) => {
                    this.errorMessage = 'Failed to update account: ' + err.message;
                }
            });
        }
    }

    onSubmitPassword(): void {
        if (this.passwordForm.valid) {
            const {oldPassword, newPassword, confirmPassword} = this.passwordForm.value;
            this.userService.updateUser(this.loggedInUserUsername, oldPassword, newPassword, confirmPassword).subscribe({
                next: () => {
                    this.passwordForm.reset();
                    this.highlightChangedFields(this.passwordForm);
                },
                error: (err) => {
                    this.errorMessage = 'Failed to update password: ' + err.message;
                }
            });
        } else {
            this.errorMessage = 'Please fill in all password fields';
        }
    }

    updateProfile(userProfile: UserProfileRequest) {
        return this.userProfileService.saveUserProfile(userProfile).pipe(
            tap(() => this.loadUserProfile()),
            catchError(err => {
                this.errorMessage = 'Failed to update profile: ' + err.message;
                return of(null);
            })
        );
    }

    deactivateAccount(): void {
        if (this.deactivateForm.valid) {
            const oldPasswordDeactivate = this.deactivateForm.value.oldPasswordDeactivate;
            this.userService.deactivate(this.loggedInUserUsername, oldPasswordDeactivate).subscribe({
                next: () => {
                    this.authService.logout();
                    this.router.navigate(['/register']).then(() => {
                    });
                },
                error: (err) => {
                    this.errorMessage = 'Failed to deactivate account: ' + err.message;
                }
            });
        } else {
            this.errorMessage = 'Please provide the old password';
        }
    }

    highlightChangedFields(form: FormGroup): void {
        Object.keys(form.controls).forEach(key => {
            if (this.changedFields[key]) {
                this.changedFields[key] = false;
                const container = document.querySelector(`.highlighted-container`);
                if (container) {
                    container.classList.add('highlight');
                    setTimeout(() => {
                        container.classList.remove('highlight');
                    }, 1000); // Duration should match the animation duration
                }
            }
        });
    }


    setActiveForm(formName: string): void {
        this.activeForm = formName;
    }
}
