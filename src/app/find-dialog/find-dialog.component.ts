import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {Guest} from '../guest';

@Component({
  selector: 'find-dialog',
  templateUrl: './find-dialog.component.html',
  styleUrls: ['./find-dialog.component.css']
})
export class FindDialogComponent implements OnInit {

  @Input() invites: Guest[]
  @Output() onGoBack = new EventEmitter<String>()
  @Output() onSaveInvite = new EventEmitter<Guest>()
  
  selectedGuest: Guest

  constructor() { }

  ngOnInit() {
  }

  goBack () {
    this.onGoBack.emit('profile')
  }

  saveInvite () {
    this.onSaveInvite.emit(this.selectedGuest)
  }

}
