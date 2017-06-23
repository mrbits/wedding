import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {Guest} from '../guest';
import {AuthService} from '../services/auth.service';
import {NoWhitespaceDirective} from '../shared/no-whitespace.directive';

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
  active = true
  emailInvalid: Boolean = false
  isCreate: Boolean
  EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  firstNameFormControl: FormControl
  lastNameFormControl: FormControl
  emailFormControl: FormControl
  passwordFormControl: FormControl
  initialEmail: String = ''
  constructor (private authService: AuthService) { }
  // constructor(public dialogRef: MdDialogRef<ProfileDialogComponent>) { }

  ngOnInit() {
    console.log('profile dialog..')
    // console.log(this.data)
    console.log(this.guest)
    this.firstNameFormControl = new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('.*\\S.*[a-zA-z0-9 ]')])
    this.lastNameFormControl = new FormControl('', [Validators.required, Validators.minLength(2)])
    this.emailFormControl = new FormControl('', [Validators.required, Validators.pattern(this.EMAIL_REGEX)])
    this.passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), this.checkPasswords.bind(this)])
    
    if (this.guest._id === undefined) {
      this.isCreate = true
      this.checkEmail(this.emailFormControl)
    } else {
      this.isCreate = false
      this.initialEmail = this.guest.email
      if (this.guest.invite) {
        this.firstNameFormControl.disable(true)
        this.lastNameFormControl.disable(true)
      } else {
        this.emailFormControl.disable(true)
      }
    }

    this.emailFormControl.valueChanges
        .debounceTime(500)
        .subscribe(() => { 
          console.log('do..')
          if (this.isCreate || this.guest.email !== this.initialEmail) this.checkEmail(this.emailFormControl)
        })
  }

  goBack () {
    if (this.isCreate) {
      this.onGoBack.emit('login')
    } else {
      this.onGoBack.emit('close')
    }
  }

  findInvite () {
    // if (this.validateService.validateGuest(this.guest, true)) {
      this.onFindInvite.emit(this.guest)
    // }
  }

  saveProfile () {
    // if (this.validateService.validateGuest(this.guest, false)) {
      this.onSaveProfile.emit(this.guest)
    // }
  }

  checkMinTrim (value: String, numSpaces: number) {
    console.log(value)
    console.log(numSpaces)
    return true
  }

  checkEmail (fieldControl) {
    if (this.guest == undefined || this.guest.email == undefined || this.guest.email === '') {
      // this.emailInvalid = false
      if (this.emailFormControl.errors != null) delete this.emailFormControl.errors.emailInvalid
      // return {NotEqual: true}
    } else {
      // fieldControl.valueChanges.debounceTime(500).switchMap((val) => {
        return this.authService.checkEmail(this.guest.email)
      // })
      .subscribe(res => {
        console.log(res)
        if (res.success) {
          
          // this.emailInvalid = false
          console.log(this.emailFormControl.errors)
          if (this.emailFormControl.errors != null) delete this.emailFormControl.errors.emailInvalid
          // this.emailFormControl.errors.filter(err => err !== 'emailInvalid')
          //this.emailFormControl.setErrors({'emailInvalid':false})
          return null
        } else {
          // this.emailInvalid = true
          this.emailFormControl.setErrors({'emailInvalid':true})
          this.checkEmailValid(this.emailFormControl)
          // return {NotEqual: false}
          return { NotEqual: true }
        }
      })
    }
  }

  checkEmailValid (fieldControl) {
    console.log(fieldControl)
    console.log(this.guest.email)
    console.log(this.emailInvalid)
    // if (this.emailInvalid) {
    //   return {'emailInvalid': true}
    // } else {
    //   return {'emailInvalid': false}
    // }
  }

  checkPasswords (fieldControl) {
    // console.log(fieldControl.value)
    // console.log(this.guest)
    // console.log(this.guest.unicorn)
    if (this.guest == undefined) {
      // console.log('undefined')
      return null
    } else {
      // console.log('not undefined')
      // console.log(fieldControl.value === this.guest.unicorn ? null : {NotEqual: true})
      return fieldControl.value === this.guest.unicorn ? null : { NotEqual: true }
    }
  }

  checkCreate (confirmPassword) {
    // console.log(confirmPassword)
    if (this.firstNameFormControl.valid && this.lastNameFormControl.valid && 
        this.emailFormControl.valid && this.passwordFormControl.valid && confirmPassword != undefined && confirmPassword.trim() != '') {
      return true
    } else {
      return false
    }
  }

  checkUpdate () {
    if ((this.firstNameFormControl.valid || this.firstNameFormControl.disabled) 
          && (this.lastNameFormControl.valid || this.lastNameFormControl.disabled)
          && this.emailFormControl.valid || this.emailFormControl.disabled) {
          return true
        } else {
          return false
        }
  }

  trim (obj) {
    obj.guest[obj.key] = obj.guest[obj.key].trim()
    console.log(obj)
  }

  // validateGuest (guest, isRegistration) {
  //   if(guest.firstName == undefined || guest.lastName == undefined || guest.email == undefined || (guest.unicorn == undefined && isRegistration)){
  //     return false
  //   }
  // }
}
