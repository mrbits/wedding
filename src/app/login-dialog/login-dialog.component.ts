import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import { FacebookService, InitParams, LoginResponse, UIResponse, UIParams, LoginOptions } from 'ngx-facebook';

import {AuthService} from '../services/auth.service';

@Component({
  selector: 'login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent  {
  @Output() onGoBack = new EventEmitter<String>()
  @Output() onLogin = new EventEmitter<any>()
  @Output() onFacebookLogin = new EventEmitter<any>()

  emailLoginFormControl: FormControl
  passwordLoginFormControl: FormControl
  selectFormControl: FormControl
  EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  constructor(private fb: FacebookService) { 
    this.fb.init({
      appId: '2028039097221584',
      xfbml: true,
      version: 'v2.9'
    })
    .then(res => console.log(res))
  }
  ngOnInit() {
    console.log('on init.')
    this.emailLoginFormControl = new FormControl('', [Validators.required, Validators.pattern(this.EMAIL_REGEX)])
    this.passwordLoginFormControl = new FormControl('', [Validators.required, Validators.minLength(8)])
    this.selectFormControl = new FormControl('')
  }

  getDialog(option: any) {
    this.selectFormControl.setValue(undefined)
    if (option.value == undefined) {
      console.log('option null..')
    } else {
      this.onGoBack.emit(option.value)
    }
  }

  loginWithFacebook(): void {
    const loginOptions: LoginOptions = {
      enable_profile_selector: true,
      return_scopes: true,
      scope: 'public_profile,email'
    };

    this.fb.login(loginOptions)
      .then((res: LoginResponse) => {
        console.log('Logged in', res)
        this.getFacebookProfile((err, profile) => {
          console.log('get profile..')
          console.log(err)
          console.log(profile)
          profile.status = res.status
          this.onFacebookLogin.emit({status: res.status, facebookId: profile.id, firstName: profile.first_name, lastName: profile.last_name})
        })
      })
      .catch(err => console.log('error', err))
    
  }

  getFacebookProfile (cb) {
    this.fb.api('/me?fields=id,first_name,last_name,email')
      .then((res: any) => {
        console.log('Got the users profile', res);
        cb(null, res)
      })
      .catch(err => {
        console.log("error", err)
        cb(err, null)
      });
  }
  
  loginCustom(email: String, password: String) {
    console.log('login custom..')
    console.log(email)
    console.log(password)

    this.onLogin.emit({email: email, password: password})

  }

  checkLoginFields () {
    if (this.emailLoginFormControl.valid && this.passwordLoginFormControl.valid) {
      return true
    } else {
      return false
    }
  }

  trim (obj) {
    obj.value = obj.value.trim()
    console.log(obj)
  }
}
