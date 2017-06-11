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
    // console.log(this.invites)
  }

  goBack () {
    console.log(this.invites.filter(guest => guest.facebookId !== undefined).length)
    if (this.invites.filter(guest => guest.facebookId !== undefined).length>0){
      this.onGoBack.emit('login')
    } else {
      this.onGoBack.emit('profile')
    }
    
  }

  saveInvite () {
    console.log('save invite..', this.selectedGuest)
    this.onSaveInvite.emit(this.selectedGuest)
  }

}
