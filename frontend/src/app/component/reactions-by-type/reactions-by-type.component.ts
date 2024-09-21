import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ReactionTypeResponse} from '../../model/response/ReactionTypeResponse';
import {Reaction} from '../../model/entity/Reaction';
import {ReactionService} from '../../service/reaction.service';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {NgForOf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'reactions-by-type',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './reactions-by-type.component.html',
  styleUrls: ['./reactions-by-type.component.css']
})
export class ReactionsByTypeComponent implements OnInit {
  userReactionsByType: Map<ReactionTypeResponse, { reactions: Reaction[], count: number }> = new Map();
  types: ReactionTypeResponse[] = [];
  @Input() postId!: number;
  @Output() visibilityChange = new EventEmitter<boolean>();
  isVisible: boolean = true;

  constructor(private reactionService: ReactionService) {
  }

  ngOnInit(): void {
    this.loadReactionsByType(this.postId);


    this.reactionService.reactionCreated$.subscribe(() => {
      this.loadReactionsByType(this.postId);
    });

    this.reactionService.reactionDeleted$.subscribe(() => {
      this.loadReactionsByType(this.postId);
    });
  }

  loadReactionsByType(postId: number): void {
    this.reactionService.getReactionTypes().pipe(
      switchMap((types: ReactionTypeResponse[]) => {
        this.types = types;

        const requests = types.map(type =>
          this.reactionService.getAllByType(postId, type.type)
        );

        return forkJoin(requests);
      })
    ).subscribe({
      next: (responses: Reaction[][]) => {
        responses.forEach((reactions: Reaction[], index: number) => {
          this.userReactionsByType.set(this.types[index], {
            reactions: reactions,
            count: reactions.length
          });
        });
        console.log(this.userReactionsByType);
      },
      error: (err) => console.error('Error loading reactions by type', err)
    });
  }

  getAllReactionsSorted(): Reaction[] {
    return Array.from(this.userReactionsByType.values())
      .flatMap(entry => entry.reactions)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getReactionsByTypeSorted(type: ReactionTypeResponse): Reaction[] {
    const reactionsForType = this.userReactionsByType.get(type)?.reactions || [];
    return reactionsForType.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  closePopup(): void {
    this.isVisible = false;
    this.visibilityChange.emit(this.isVisible);
  }

}
