import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
// import { FormsModule } from '@angular/forms';
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

  selectedValue: string 
  constructor(private fb: FacebookService) { 
     this.fb.init({
      appId: '739283566249095',
      xfbml: true,
      version: 'v2.9'
    })
      .then(res => console.log(res));
  }
  // constructor(public dialogRef: MdDialogRef<LoginDialogComponent>) { }

  ngOnInit() {
    console.log('on init.')
  }

  getDialog(option: any) {
    console.log('get dialog..')
    console.log(option.value)
    this.onGoBack.emit(option.value)
    // if (option.value === 'forgot') {
    //   //open forgot dialog
    //   // this.onGoBack.emit('forgot')
    // } else if (option.value === 'create') {
    //   //open create dialog

    // }
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
        // this.onFacebookLogin.emit(res)
      })
      .catch(err => console.log('error', err));

    // const loginOptions: LoginOptions = {
    //   // enable_profile_selector: true,
    //   return_scopes: true,
    //   scope: 'public_profile,email'
    // };
    // this.fb.login(loginOptions)
    // .then((res: LoginResponse) => {
    //   console.log(res)
    //   if (res.status === 'connected') {
    //     this.getProfile()
    //   } else {

    //   }
    // })
    // .catch(err => {
    //   console.error("error",err)
    //   this.onFacebookLogin.emit(err)
    // });
    
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

    // this.authService.authenticateUser(email, password)
    //   .subscribe(res => {
    //     if (res.success) {
    //       console.log('success..')
    //       console.log(res)
    //       this.authService.storeUserData(res.token, res.guests)
    //       this.dialogRef.close()
    //     } else {
    //       console.log('error..')
    //       console.log(res)
    //     }
    //   })
  }
}
