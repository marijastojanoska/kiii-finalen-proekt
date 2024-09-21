import {Component, OnInit} from '@angular/core';
import {SearchComponent} from "../search/search.component";
import {RouterLink} from "@angular/router";
import {AllNotificationsComponent} from "../all-notifications/all-notifications.component";
import {NgIf} from "@angular/common";
import {LoggedInUserService} from "../../service/logged-in-user.service";

@Component({
    selector: 'navbar',
    standalone: true,
    imports: [SearchComponent, RouterLink, AllNotificationsComponent, NgIf],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

    loggedInUserUsername: string = ''

    constructor(private loggedInUserService: LoggedInUserService,) {
    }

    ngOnInit(): void {
        this.loggedInUserService.user$.subscribe(user => this.loggedInUserUsername = user?.username!);
    }
}
