import {Component, OnInit} from '@angular/core';
import {UserProfileService} from '../../service/user-profile.service';
import {ImageService} from '../../service/image.service';
import {UserProfile} from '../../model/entity/UserProfile';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {switchMap, tap, catchError} from 'rxjs/operators';
import {FollowService} from '../../service/follow.service';
import {FollowListComponent} from '../follow-list/follow-list.component';
import {LoggedInUserService} from '../../service/logged-in-user.service';
import {AuthService} from "../../service/auth.service";

@Component({
    selector: 'user-profile',
    standalone: true,
    imports: [NgIf, FollowListComponent, RouterLink],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
    currentProfile: UserProfile | null = null;
    loggedInUserUsername: string = '';
    following: number = 0;
    followers: number = 0;
    followersShown: boolean = true;

    constructor(
        private userProfileService: UserProfileService,
        private imageService: ImageService,
        private followService: FollowService,
        private authService: AuthService,
        private loggedInUserService: LoggedInUserService
    ) {
    }

    ngOnInit(): void {
        this.loggedInUserService.user$.pipe(
            switchMap(user => {
                if (!user?.username) {

                    return of({profile: null, followers: 0, following: 0});
                }
                this.loggedInUserUsername = user.username;
                return forkJoin({
                    profile: this.userProfileService.getUserProfileByUsername(this.loggedInUserUsername),
                    followers: this.followService.getFollowersCount(this.loggedInUserUsername),
                    following: this.followService.getFollowingCount(this.loggedInUserUsername)
                }).pipe(
                    switchMap(({profile, followers, following}) => {
                        if (profile?.profilePicture) {
                            return this.imageService.getImageById(profile.profilePicture.id).pipe(
                                tap(image => {
                                    if (profile) {
                                        profile.profilePicture.image = image.image;
                                    }
                                }),
                                catchError(err => {
                                    console.error('Error fetching profile picture:', err);
                                    return of(profile);
                                }),
                                switchMap(() => of({profile, followers, following}))
                            );
                        }
                        return of({profile, followers, following});
                    })
                );
            })
        ).subscribe({
            next: ({profile, followers, following}) => {
              console.log(profile);
              this.currentProfile = profile;
                this.followers = followers;
                this.following = following;
            },
            error: (err) => {
                console.error('Error loading user profile or counts:', err);
            }
        });
    }

    logout(): void {
        this.authService.logout();
    }
}
