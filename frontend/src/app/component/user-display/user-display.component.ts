import {Component, Input} from '@angular/core';
import {User} from "../../model/entity/User";
import {NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'user-display',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './user-display.component.html',
  styleUrl: './user-display.component.css'
})
export class UserDisplayComponent {
  @Input() user!: User;
}
