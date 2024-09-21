import {Component} from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";


@Component({
  selector: 'deactivated-user',
  standalone: true,
  imports: [
    NavbarComponent
  ],
  templateUrl: './deactivated-user.component.html',
  styleUrl: './deactivated-user.component.css'
})
export class DeactivatedUserComponent {

}
