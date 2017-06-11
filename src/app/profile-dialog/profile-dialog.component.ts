import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {Guest} from '../guest';

@Component({
  selector: 'profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent implements OnInit {
  @Input() guest: Guest
  @Output() onGoBack = new EventEmitter<String>()
  @Output() onFindInvite = new EventEmitter<Guest>()
  @Output() onSaveProfile = new EventEmitter<Guest>()

  isCreate: Boolean

  constructor () { }
  // constructor(public dialogRef: MdDialogRef<ProfileDialogComponent>) { }

  ngOnInit() {
    console.log('profile dialog..')
    // console.log(this.data)
    console.log(this.guest)
    if (this.guest._id === undefined) {
      this.isCreate = true
    } else {
      this.isCreate = false
    }
  }

  goBack () {
    this.onGoBack.emit('login')
  }

  findInvite (email: String) {
    this.onFindInvite.emit(this.guest)
  }

  saveProfile () {
    this.onSaveProfile.emit(this.guest)
  }

}
