import {Component, OnInit} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {NotificationService} from '../../service/notification.service';
import {Notification} from '../../model/entity/Notification';
import {AuthService} from '../../service/auth.service';
import {forkJoin, switchMap, timer} from 'rxjs';
import {LoggedInUserService} from "../../service/logged-in-user.service";
import {tap} from "rxjs/operators";

@Component({
  selector: 'all-notifications',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './all-notifications.component.html',
  styleUrls: ['./all-notifications.component.css']
})
export class AllNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loggedInUserUsername: string = '';
  size: number = 3;
  unreadCount: number = 0;
  showNotifications: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private loggedInUserService: LoggedInUserService,
  ) {
  }

  ngOnInit(): void {
    this.loggedInUserService.user$.pipe(
      switchMap(user => {
        if (!user || !user.username) {
          return [];
        }
        this.loggedInUserUsername = user.username;
        return this.notificationService.getNotificationsForUser(this.loggedInUserUsername, this.size).pipe(
          switchMap(notifications => {
            return this.notificationService.countByUserUsernameAndReadFalse(this.loggedInUserUsername).pipe(
              switchMap(unreadCount => {
                return [{notifications, unreadCount}];
              })
            );
          })
        );
      })
    ).subscribe({
      next: ({notifications, unreadCount}) => {
        this.notifications = notifications;
        this.unreadCount = unreadCount;
      },
      error: (err) => {
        console.error('Error loading notifications or unread count', err);
      }
    });


    this.notificationService.notificationRead$.subscribe((notification: Notification) => {
      this.notifications = this.notifications.map(n =>
        n.id === notification.id ? notification : n
      );
      this.setUnreadNotificationsCount();
    })


    this.notificationService.allNotificationsRead$.subscribe(() => {
      this.notifications = this.notifications?.map(n => ({
        ...n,
        read: true
      }));
      this.setUnreadNotificationsCount();
    })


    this.notificationService.notificationDeleted$.subscribe((notificationId: number) => {
      this.notifications = this.notifications?.filter(n => n.id !== notificationId);
      this.size=this.size-1;
      this.setUnreadNotificationsCount();
    })


    this.notificationService.allNotificationsDeleted$.subscribe(() => {
      this.notifications = [];
      this.setUnreadNotificationsCount();
    })
  }

  loadNotifications(): void {
    this.notificationService.getNotificationsForUser(this.loggedInUserUsername!, this.size)
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
        }
      });

    this.notificationService.countByUserUsernameAndReadFalse(this.loggedInUserUsername)
      .subscribe({
        next: (count) => {
          this.unreadCount = count;
        }
      });
  }

  loadMore(): void {
    this.size += 3;
    this.loadNotifications();
  }

  loadLess(): void {
    if (this.size > 3) {
      this.size -= 3;
      this.loadNotifications();
    }
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.error('Notification deleted');
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        console.error('Notifications not read count', this.unreadCount);
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });
  }

  deleteAllNotifications(): void {
    this.notificationService.deleteAllNotifications(this.loggedInUserUsername).subscribe({
      error: (err) => console.error('Error deleting notifications:', err)
    });
  }

  markAsReadAllNotifications(){
    this.notificationService.markAsReadAllNotifications(this.loggedInUserUsername).subscribe({
      error:(err)=> console.error('Error in mark as read all notifications', err)
    })
  }
  markAsReadSeenNotifications(): void {
    const unreadNotifications = this.notifications.filter(notification => !notification.read);

    if (unreadNotifications.length === 0) {
      return;
    }

    const markAsReadObservables = unreadNotifications.map(notification =>
      this.notificationService.markNotificationAsRead(notification.id)
    );

    forkJoin(markAsReadObservables).subscribe({
      next: () => {
        console.error('All visible notifications marked as read');
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        this.setUnreadNotificationsCount();
      },
      error: (err) => {
        console.error('Error marking visible notifications as read:', err);
      }
    });
  }

  setUnreadNotificationsCount(): void {
    this.notificationService.countByUserUsernameAndReadFalse(this.loggedInUserUsername)
      .subscribe(counter => this.unreadCount = counter);
  }

  toggleNotifications(): void {
    if (this.showNotifications) {
      timer(10).subscribe(() => {
        this.markAsReadSeenNotifications();
      });
    }
    this.showNotifications = !this.showNotifications;
  }
}
