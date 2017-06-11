import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
// import { FormsModule } from '@angular/forms';
import { FacebookService, InitParams, LoginResponse, UIParams, LoginOptions } from 'ngx-facebook';
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

  config: MdSnackBarConfig
  actionButtonLabel: string = ''

  private ngUnsubscribe: Subject<void> = new Subject<void>()

   constructor(public dialogRef: MdDialogRef<DialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private fb: FacebookService,
    public snackbar: MdSnackBar) {
    
    if (this.data.guest == null) {
      console.log('guest is null..')
      this.guest = new Guest()
    } else {
      this.guest = this.data.guest
    }

    let initParams: InitParams = {
      appId: '739283566249095',
      xfbml: true,
      version: 'v2.9'
    };


    fb.init(initParams)

    this.config = new MdSnackBarConfig();
    this.config.duration = 5000;
    
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
    console.log('on find invite..')
    console.log(guest)
    this.authService.getPartyFromValue(guest.email, guest.firstName, guest.lastName, guest.facebookId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        if (res.success) {
          res.guests.forEach(g => {
            g.unicorn = guest.unicorn
            g.facebookId = guest.facebookId
          })
          console.log(res.guests)
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
    console.log('on save invite..',guest)
    this.authService.registerUser(guest)
    .subscribe(res => {
      console.log(res)
      this.snackbar.open(res.msg, this.actionButtonLabel, this.config)
      if (guest.facebookId !== undefined) {
        this.onFacebookLogin({status: 'connected', facebookId: guest.facebookId})
      } else {
        this.onLogin({email: guest.email, password: guest.unicorn})
        // guest.unicorn = ''
      }
      // this.onGoBack('profile')
      // this.dialogRef.close()
    })
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

  onFacebookLogin (facebookRes: any) {
    console.log('response..')
    console.log(facebookRes)

    if (facebookRes.status === 'connected') {
          //validate facebook login
        this.loginWithFacebook(facebookRes)
      }
      // this.fb.api('/me?id,first_name,last_name,email')
      // .then((res: any) => {
      //   console.log('Got the users profile', res);
      // })
      // .catch(err => console.error(err));
    // }
    // const loginOptions: LoginOptions = {
    //   // enable_profile_selector: true,
    //   return_scopes: true,
    //   scope: 'public_profile,email'
    // };
    // this.fb.login(loginOptions)
    // .then((res: LoginResponse) => {console.log(res)})
    // .catch(err => console.error("error",err))

    // FB.login(function(response) {
    //     // handle the response
    //     console.log(response)
    // }, {
    //     scope: 'public_profile,email', 
    //     return_scopes: true
    // });
    // this.authService.authenticateFacebookUser()
    // .then(res => {
    //   console.log('login response..');
    //   console.log(res);

    //   if(res.status==='authorized'){
    //     this.authService.getFBProfile()
    //     .then(res => {
    //       // this.dialogRef.close(this.guest);
    //     })
    //   } else {
    //     // this.dialogRef.close(this.guest);
    //   }
    // });
  }

  loginWithFacebook (facebookRes: any) {
    console.log('facebookres..',facebookRes)
    if (facebookRes.facebookId !== undefined) {
      this.authService.authenticateFacebookUser(facebookRes.facebookId)
      .subscribe(res => {
        if (res.success) {
          console.log('logged in successfully..')
          this.authService.storeUserData(res.token, res.guests)
          this.dialogRef.close()
          
        } else {
          console.log('failed to login', res)
          this.guest.facebookId = facebookRes.facebookId
          if (this.guest.email !== '' && this.guest.email !== undefined) {
            this.guest.email = facebookRes.email
          }
          this.guest.firstName = facebookRes.firstName
          this.guest.lastName = facebookRes.lastName
          this.onFindInvite(this.guest)
        }
      })
    }
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
