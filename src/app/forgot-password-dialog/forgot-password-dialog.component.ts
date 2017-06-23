import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import {MdDialog, MdDialogConfig, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

import {Guest} from '../guest';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
  @Input() guest: Guest
  @Input() isQuery: Boolean
  @Input() isClicked: Boolean
  @Output() onGoBack = new EventEmitter<String>()
  @Output() onResetPassword = new EventEmitter<String>()

  emailForgotFormControl: FormControl
  EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


  constructor(private authForgotService: AuthService) { }

  ngOnInit() {
    this.emailForgotFormControl = new FormControl('', [Validators.required, Validators.pattern(this.EMAIL_REGEX)])
    this.checkForgotEmail(this.emailForgotFormControl)
    this.emailForgotFormControl.valueChanges
        .debounceTime(500)
        .subscribe(() => { 
          console.log('do..')
          this.checkForgotEmail(this.emailForgotFormControl)
        })
      // this.buildForm()
  }

  goBack () {
    this.onGoBack.emit('login')
  }

  resetPassword (email: String) {
    console.log(email)
    this.onResetPassword.emit(email)
  }

  checkResetFields () {
    if (this.emailForgotFormControl.valid) {
      return true
    } else {
      return false
    }
  }

  trim (obj) {
    obj.value = obj.value.trim()
    console.log(obj)
  }

  checkForgotEmail (fieldControl) {
    if (this.guest == undefined || this.guest.email == undefined || this.guest.email === '') {
      // this.emailInvalid = false
      if (this.emailForgotFormControl.errors != null) delete this.emailForgotFormControl.errors.emailInvalid
      // return {NotEqual: true}
    } else {
      // fieldControl.valueChanges.debounceTime(500).switchMap((val) => {
        return this.authForgotService.checkEmail(this.guest.email)
      // })
      .subscribe(res => {
        console.log(res)
        if (res.success) {
          this.emailForgotFormControl.setErrors({'emailInvalid':true})
          return { NotEqual: true }

        } else {
          console.log(this.emailForgotFormControl.errors)
          if (this.emailForgotFormControl.errors != null) delete this.emailForgotFormControl.errors.emailInvalid
          return null
        }
      })
    }
  }

}
