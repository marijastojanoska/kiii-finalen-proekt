import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'confirm-action',
  standalone: true,
  imports: [],
  templateUrl: './confirm-action.component.html',
  styleUrl: './confirm-action.component.css'
})
export class ConfirmActionComponent {

  @Input() message: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }


}
