import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RegisterComponent} from './component/register/register.component';
import {LoggedInUserService} from './service/logged-in-user.service';
import {User} from "./model/entity/User";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private loggedInUserService: LoggedInUserService) {
  }

  ngOnInit(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.loggedInUserService.loadUser().subscribe();
    }
  }
}
