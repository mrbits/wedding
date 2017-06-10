import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import {MdDialog, MdDialogConfig, MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {Guest} from '../guest';
@Component({
  selector: 'forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
  @Input() guest: Guest
  @Output() onGoBack = new EventEmitter<String>()
  @Output() onResetPassword = new EventEmitter<String>()

  constructor() { }

  ngOnInit() {
  }

  goBack () {
    this.onGoBack.emit('login')
  }

  resetPassword (email: String) {
    console.log(email)
    this.onResetPassword.emit(email)
  }

}
