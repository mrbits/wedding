import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
// import { FormsModule } from '@angular/forms';
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';

import {Guest} from '../guest';

import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  findHidden: Boolean = true
  forgotHidden: Boolean = true
  loginHidden: Boolean = true
  profileHidden: Boolean = true

  guest: Guest
  invites: Guest[]

  private ngUnsubscribe: Subject<void> = new Subject<void>()

   constructor(public dialogRef: MdDialogRef<DialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private authService: AuthService) {
      if (this.data.guest == null) {
        console.log('guest is null..')
        this.guest = new Guest()
      } else {
        this.guest = this.data.guest
      }
     }

  ngOnInit() {
    console.log(this.data)
    if (this.data.dialog === 'login') {
      this.loginHidden = false;
      this.findHidden = true;
      this.forgotHidden = true;
      this.profileHidden = true;
    } else if (this.data.dialog === 'profile') {
      this.profileHidden = false;
      this.findHidden = true;
      this.forgotHidden = true;
      this.loginHidden = true;
    }
  }

  onFindInvite (guest: Guest) {
    this.authService.getPartyFromValue(guest.email, guest.firstName, guest.lastName, guest.facebookId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        if (res.success) {
          this.invites = res.guests
          this.hideAllDialogs()
          this.findHidden = false
        }
      })
  }

  onGoBack (dialogScreen: string) {
    console.log('on go back..')
    console.log(dialogScreen)
    this.hideAllDialogs()

    switch(dialogScreen) {
      case 'find':  this.findHidden = false; 
      break;
      case 'forgot': this.forgotHidden = false;
      break;
      case 'login': this.loginHidden = false;
      break;
      case 'profile': this.profileHidden = false;
      break;
    }
  }

  onSaveInvite (guest: Guest) {
    this.authService.registerUser(guest)
  }

  onSaveProfile (guest: Guest) {
    console.log('on save profile..')
    console.log(guest)
    this.authService.updateGuest(guest)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        console.log(res)
        if (res.success) {
          //profile update saved successfully
          this.dialogRef.close()
        }
      })
  }

  hideAllDialogs () {
    this.findHidden = true;
    this.forgotHidden = true;
    this.loginHidden = true;
    this.profileHidden = true;
  }

  onLogin (creds: any) {
    this.authService.authenticateUser(creds.email, creds.password)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        if (res.success) {
          console.log(res)
          this.authService.storeUserData(res.token, res.guests)
          this.dialogRef.close()
        } else {
          console.log('unsuccess..')
          console.log(res)
        }
      })
  }

  onResetPassword (email: String) {
    console.log('on forgot password..')
    console.log(email)
    this.authService.resetPassword(email)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        console.log(res)
      })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }
}
