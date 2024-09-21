import {Component, Input, OnInit} from '@angular/core';
import {ReactionService} from '../../service/reaction.service';
import {Reaction} from '../../model/entity/Reaction';
import {ReactionTypeResponse} from '../../model/response/ReactionTypeResponse';
import {NgForOf, NgIf} from '@angular/common';
import {LoggedInUserService} from "../../service/logged-in-user.service";
import {ReactionsByTypeComponent} from "../reactions-by-type/reactions-by-type.component";

@Component({
  selector: 'reaction',
  standalone: true,
  imports: [NgForOf, NgIf, ReactionsByTypeComponent],
  templateUrl: './reaction.component.html',
  styleUrls: ['./reaction.component.css']
})
export class ReactionComponent implements OnInit {
  @Input() postId!: number;
  reactionTypes: ReactionTypeResponse[] = [];
  reactionCountsMap: Map<string, number> = new Map();
  loggedInUserUsername: string = '';
  showReactions: boolean = false;
  showReactionsByType: boolean = false;
  selectedReaction: string | null = null;
  reactionCounts: number = 0;

  constructor(
    private reactionService: ReactionService,
    private loggedInUserService: LoggedInUserService,
  ) {
  }

  ngOnInit(): void {
    this.loggedInUserService.user$.subscribe(user => this.loggedInUserUsername = user?.username!);

    this.loadReactionTypes();
    this.loadReactionCountsMap();


    this.reactionService.reactionCreated$.subscribe(() => {
      this.loadReactionCountsMap();
      this.loadReactionCounts()
    });

    this.reactionService.reactionDeleted$.subscribe(() => {
      this.loadReactionCountsMap();
      this.loadReactionCounts()
    });
  }

  loadReactionTypes(): void {
    this.reactionService.getReactionTypes().subscribe({
      next: (types: ReactionTypeResponse[]) => {
        this.reactionTypes = types;
      },
      error: (err) => console.error('Error fetching reaction types:', err)
    });
  }

  loadReactionCountsMap(): void {
    this.reactionService.getReactionsByPost(this.postId).subscribe({
      next: (reactions: Reaction[]) => {
        const counts = new Map<string, number>();
        this.reactionTypes.forEach(reactionType => {
          counts.set(reactionType.emoji, 0);
        });
        reactions.forEach(reaction => {
          const emoji = reaction.type.emoji;
          counts.set(emoji, (counts.get(emoji) || 0) + 1);
        });
        this.reactionCountsMap = counts;
        this.loadUserReaction(reactions);
        this.loadReactionCounts();
      },
      error: (err) => {
        console.error('Error fetching reactions:', err);
        const counts = new Map<string, number>();
        this.reactionTypes.forEach(reactionType => {
          counts.set(reactionType.emoji, 0);
        });
        this.reactionCountsMap = counts;
      }
    });
  }

  loadReactionCounts(): void {
    this.reactionCounts = Array.from(this.reactionCountsMap.values()).reduce((sum, count) => sum + count, 0);
  }

  loadUserReaction(reactions: Reaction[]): void {
    const userReaction = reactions.find(reaction => reaction.user.username === this.loggedInUserUsername);
    this.selectedReaction = userReaction ? userReaction.type.type : null;
  }

  toggleReactions(): void {
    this.showReactions = !this.showReactions;
  }

  addReaction(type: string): void {
    if (this.selectedReaction === type) {
      this.reactionService.getReactionsByPost(this.postId).subscribe({
        next: (reactions: Reaction[]) => {
          const reactionToDelete = reactions.find(r => r.user.username === this.loggedInUserUsername && r.type.type === type);
          if (reactionToDelete) {
            this.reactionService.deleteReaction(reactionToDelete.id, this.loggedInUserUsername).subscribe({
              next: () => {
                this.selectedReaction = null;
              },
              error: (err) => console.error('Error removing reaction:', err)
            });
          }
        }
      });
    } else {
      this.reactionService.createReaction(this.postId, this.loggedInUserUsername, type).subscribe({
        next: () => {
          this.selectedReaction = type;
        },
        error: (err) => console.error('Error creating reaction:', err)
      });
    }
  }

  getEmojiForReaction(type: string): string {
    const reaction = this.reactionTypes.find(r => r.type === type);
    return reaction ? reaction.emoji : '';
  }


  toggleReactionsByType() {
    this.showReactionsByType = !this.showReactionsByType;
  }

  handleVisibilityChange(isVisible: boolean) {
    this.showReactionsByType = isVisible;
  }
}
