import { Component,OnInit,OnDestroy } from '@angular/core';
import {MdIconRegistry,MdDialogRef, MdDialog, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import { FacebookService, InitParams, LoginResponse, UIParams, LoginOptions, LoginStatus } from 'ngx-facebook';
import { ActivatedRoute, Params, Router } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';
import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {Guest} from './guest';

import {DialogComponent} from './dialog/dialog.component';
import {ProfileDialogComponent} from './profile-dialog/profile-dialog.component';
import {ForgotPasswordDialogComponent} from './forgot-password-dialog/forgot-password-dialog.component';

import {AuthService} from './services/auth.service';
import {GuestService} from './services/guest.service';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  guest: Guest;
  party: Guest[];
  isAuthorized: Boolean = false;
  showGuest: Boolean = true;
  dialogRef: MdDialogRef<DialogComponent>;
  snackbarConfig: MdSnackBarConfig;
  snackbarLabel: string = '';

  title = 'Amanda & Luke\'s Wedding';
  pages = [
    {
      name: 'Wedding',
      icon: 'wedding',
      routerLink: '/wedding',
      routerLinkActive: this.isAuthorized,
    },
    {
      name: 'Invite',
      icon: 'invite-details',
      routerLink: '/invite',
      routerLinkActive: this.isAuthorized,
    },
    {
      name: 'Registry',
      icon: 'registry',
      routerLink: '/registry',
      routerLinkActive: this.isAuthorized,
    },
    {
      name: 'RSVP',
      icon: 'rsvp',
      routerLink: '/rsvp',
      routerLinkActive: this.isAuthorized,
    },
  ];

  watcher: Subscription;
  activeMediaQuery = '';
  sideNavOpened: boolean = true;
  sideNavMode: string = 'side';
  

  constructor(private iconRegistry: MdIconRegistry, private sanitizer: DomSanitizer, 
  private dialog: MdDialog, private fb: FacebookService,
  private authService:AuthService, public snackbar: MdSnackBar,
  private guestService: GuestService, private router: Router,  
  private route: ActivatedRoute, media: ObservableMedia) {
    console.log('before queryparams..')
    this.route.queryParams.forEach((params: Params) => {
      console.log(params)
    })
    console.log('after queryparams..')
    console.log('before params..')
    this.route.params.forEach((params: Params) => {
      console.log(params)
    })
    console.log('after params..')
    // To avoid XSS attacks, the URL needs to be trusted from inside of your application.
    const iconsSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('../assets/images/icons.svg');
    console.log(iconsSafeUrl)
    
    this.iconRegistry.addSvgIconSetInNamespace('icons', iconsSafeUrl);
    this.watcher = media.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : "";
      if ( change.mqAlias === 'sm' || change.mqAlias === 'xs') {
         this.loadMobileContent();
      } else {
         this.loadDesktopContent();
      }
    });
    let initParams: InitParams = {
      appId: '2028039097221584',
      xfbml: true,
      version: 'v2.9'
    };

    this.fb.init(initParams)
    .then (() => {
      this.getLoginStatus()
    })
  }

  ngOnInit(){
    console.log('before queryparams..')
    this.route.queryParams.forEach((params: Params) => {
      console.log(params)
    })
    console.log('after queryparams..')
        // if (params['token'] !== undefined) {
        //   let token = params['token']
    this.showGuest = false;
    this.snackbarConfig = new MdSnackBarConfig();
    this.snackbarConfig.duration = 5000;
    this.guestService.getParty()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(party => {
        this.party = party; 
        if (party.length>1) {
          this.isAuthorized = true 
        } else {
          this.isAuthorized = false
        }
        console.log(this.party)
      })
  }
  getGuestDetails (guest: Guest){
    console.log('get guest details')
    console.log(guest._id)
    this.guest = guest
    this.router.navigate(['/guest', guest._id])
  }

  getLoginStatus():  void {
    console.log('get login status..')

    //if localStorage token exists, check if still valid
    if (this.authService.loggedIn('id_token')){
      console.log('is authorized..');
      this.isAuthorized = true;
      this.authService.getProfile()
        .takeUntil(this.ngUnsubscribe)
        .subscribe(res => {
          console.log(res)
          this.snackbar.open(res.msg, res.title, this.snackbarConfig)
        })
    } else {
      console.log('getLoginStatus..')
      this.fb.getLoginStatus()
      .then (res => {
        console.log(res)
        // if (res.status === 'connected') {
        //   //validate facebook login
        //   this.loginWithFacebook(res.authResponse.userID)
        // } else {
          this.openDialog('login')
        // }
      })
      .catch (err => {
        console.error(err)
      })
    }
  }

  loginWithFacebook (facebookId: String) {
    if (facebookId !== undefined) {
      this.authService.authenticateFacebookUser(facebookId)
      .subscribe(res => {
        if (res.success) {
          console.log('logged in successfully..')
          this.authService.storeUserData(res.token, res.guests)
        } else {
          console.log ('failed to login', res)
          this.openDialog('login')
        }
      })
    }
  }

  openDialog (selectedDialog: string) {
    let config: MdDialogConfig = { disableClose: true, data: {dialog: selectedDialog}};
    this.dialogRef = this.dialog.open(DialogComponent, config);
    this.dialogRef.afterClosed().takeUntil(this.ngUnsubscribe).subscribe(() => {
      this.dialogRef = null;
    });
  }

  logout (){
    this.router.navigate(['/wedding'])
    this.authService.logout()
    this.fb.logout()
    this.isAuthorized = false
    this.openDialog('login')
    // this.party = [];
    this.snackbarLabel = 'Bye'
    this.snackbar.open('Stop back for more fun', this.snackbarLabel, this.snackbarConfig)
  }

  showGuestDetails (id: number){
    this.router.navigate(['/guest-detail', id]);
  }

  hideGuestDetails (){
    this.showGuest = false;
  }

  ngOnDestroy () {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.watcher.unsubscribe();
  }

  loadMobileContent () { 
    // Do something special since the viewport is currently
    // using mobile display sizes
    this.sideNavMode = 'over';
    this.sideNavOpened = false;
  }
  loadDesktopContent () { 
    // Do something special since the viewport is currently
    // using mobile display sizes
    this.sideNavMode = 'side';
    this.sideNavOpened = true;
  }
}
