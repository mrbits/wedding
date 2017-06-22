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
  constructor (private authService: AuthService) { }
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
  this.firstNameFormControl = new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('.*\\S.*[a-zA-z0-9 ]')])
  this.lastNameFormControl = new FormControl('', [Validators.required, Validators.minLength(2)])
  this.emailFormControl = new FormControl('', [Validators.required, Validators.pattern(this.EMAIL_REGEX), this.checkEmail.bind(this)])
  this.passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), this.checkPasswords.bind(this)])
  this.checkEmail()
    // this.buildForm()
  }

  // buildForm () {
  //   this.profileForm = this.fb.group({
  //     'firstNameFormControl': ['',Validators.compose([Validators.required, Validators.minLength(2)])],
  //     'lastNameFormControl': ['',Validators.compose([Validators.required, Validators.minLength(2)])],
  //     'emailFormControl': ['',Validators.compose([Validators.required, Validators.pattern(this.EMAIL_REGEX)])],
  //     'passwordFormControl': ['',Validators.required, Validators.minLength(8), this.checkPasswords.bind(this)],
  //     // 'confirmPasswordFormControl': this.confirmPasswordFormControl
  //   })
  // }
    // this.profileForm.valueChanges
    //   .subscribe(data => this.onValueChanged(data));

    // this.onValueChanged(); // (re)set validation messages now
  //   firstNameFormControl = new FormControl('', [Validators.required, Validators.minLength(2)])
  // lastNameFormControl = new FormControl('', [Validators.required, Validators.minLength(2)])
  // emailFormControl = new FormControl('', [Validators.required, Validators.pattern(this.EMAIL_REGEX)])
  // passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), this.checkPasswords.bind(this)])
  // }

  goBack () {
    this.onGoBack.emit('login')
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

  checkEmail () {
    if (this.guest == undefined || this.guest.email == undefined) {
      // this.emailInvalid = false
      // return {NotEqual: true}
    } else {
      this.authService.checkEmail(this.guest.email)
      .debounceTime(400)
      .subscribe(res => {
        console.log(res)
        if (res.success) {
          
          // this.emailInvalid = false
          return {NotEqual: true}
        } else {
          // this.emailInvalid = true
          return {NotEqual: false}
        }
      })
    }
  }

  checkEmailValid (fieldControl) {
    console.log(fieldControl)
    console.log(this.guest.email)
    console.log(this.emailInvalid)
    if (this.emailInvalid) {
      return {'emailInvalid': true}
    } else {
      return {'emailInvalid': false}
    }
  }

  checkPasswords (fieldControl) {
    // console.log(fieldControl.value)
    // console.log(this.guest)
    // console.log(this.guest.unicorn)
    if (this.guest == undefined) {
      // console.log('undefined')
      return true
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
