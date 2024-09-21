import { Component, OnInit } from '@angular/core';
import { AllPostsComponent } from "../all-posts/all-posts.component";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
  selector: 'explore-page',
  standalone: true,
  imports: [AllPostsComponent, RouterLink, NavbarComponent],
  templateUrl: './explore-page.component.html',
  styleUrls: ['./explore-page.component.css']
})
export class ExplorePageComponent implements OnInit {

  tag: string = "";

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tag = params.get('tag') || "";
    });
  }
}
