import { Component,OnInit,OnDestroy } from '@angular/core';
import {MdIconRegistry,MdDialogRef, MdDialog, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import { FacebookService, InitParams, LoginResponse, UIParams, LoginOptions } from 'ngx-facebook';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';
import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {Guest} from './guest';

// import {GuestComponent} from './guest/guest.component';
// import {GuestDetailComponent} from './guest-detail/guest-detail.component';
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
  //title = 'Amanda & Luke are getting married!';
  fbLoginResponse: LoginResponse;
  // guest: GuestComponent;
  guest: Guest;
  party: Guest[];
  // party: GuestComponent[] = [];
  isAuthorized: Boolean = false;
  showGuest: Boolean = true;
  // dialogRef: MdDialogRef<DialogComponent>;
  dialogRef: MdDialogRef<DialogComponent>;
  config: MdSnackBarConfig;
  actionButtonLabel: string = '';
  // selectedDialog: string = '';

  title = 'Amanda & Luke\'s Wedding';
  pages = [
    {
      name: 'Wedding',
      icon: 'wedding',
      routerLink: '/wedding',
      routerLinkActive: this.isAuthorized,
      // active: true,
    },
    {
      name: 'Invite',
      icon: 'invite-details',
      routerLink: '/invite',
      routerLinkActive: this.isAuthorized,
      // active: this.isAuthorized,
    },
    {
      name: 'Registry',
      icon: 'registry',
      routerLink: '/registry',
      routerLinkActive: this.isAuthorized,
      // active: this.isAuthorized,
    },
    {
      name: 'RSVP',
      icon: 'rsvp',
      routerLink: '/rsvp',
      routerLinkActive: this.isAuthorized,
      // active: this.isAuthorized,
    },
  ];

  watcher: Subscription;
  activeMediaQuery = '';
  sideNavOpened: boolean = true;
  sideNavMode: string = 'side';
  

  constructor(private iconRegistry: MdIconRegistry, private sanitizer: DomSanitizer, 
  private dialog: MdDialog, private authService:AuthService, public snackbar: MdSnackBar,
  private guestService: GuestService, private router: Router,  
  private route: ActivatedRoute, media: ObservableMedia) {
    // this.guest = new GuestComponent();
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
    this.getLoginStatus();
  }

  ngOnInit(){
    this.showGuest = false;
    this.config = new MdSnackBarConfig();
    this.config.duration = 5000;
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
    // this.getLoginStatus();

  }
  getGuestDetails (guest: Guest){
    console.log('get guest details')
    console.log(guest._id)
    this.guest = guest
    this.router.navigate(['/guest', guest._id])
  }
  // loginWithFacebook(): void {
  //   this.authService.loginWithFacebook()
  //   .then(res => {
  //     console.log('login response..');
  //     console.log(res);

  //     if(res.status==='authorized'){
  //       this.authService.getFBProfile()
  //       .then(res => {
  //         // this.dialogRef.close(this.guest);
  //       })
  //     } else {
  //       // this.dialogRef.close(this.guest);
  //     }
  //   });
  // }

  getLoginStatus():  void {
    console.log('get login status..')

    //if localStorage token exists, check if still valid
    if(this.authService.loggedIn('id_token')){
      console.log('is authorized..');
      this.isAuthorized = true;
      this.authService.getProfile()
        .takeUntil(this.ngUnsubscribe)
        .subscribe(res => {
          console.log(res)
          // this.guestService.get
        })
      // this.authService.getParty()
      // .subscribe(res => {
      //   console.log(res);
      //   let id: number = 0;
      //   res.party.forEach(guest => {
      //     id++;
      //     guest.id = id;
      //   });
      //   this.party = res.party;
      //   this.guestService.setParty(this.party);
      // });
      
    } else {
      this.openDialog('login')
    }

    // this.guestService.getPartyFromValue('lucasjschmidt@gmail.com')
    //   .subscribe(res => {
    //     this.guestService.setParty(res.guests)
    //     this.guestService.getParty()
    //       .subscribe(party => {
    //         console.log(party)
    //         this.party = party
    //         console.log(this.party)
    //         this.snackbar.open(res.msg, res.title, this.config)
    //         console.log(this.party.length)
    //         if(this.party.length<1 && !this.isAuthorized) {
    //           this.openDialog()
    //         }
            
    //       })
    //   })

      
    // this.guestService.getParty().subscribe(res => {
    //   console.log(res)
    //   this.party = res.guests
    //   this.snackbar.open(res.msg, res.title, this.config)
    // //             this.openDialog();
    // })
    
    //if localStorage token exists, check if still valid
    // if(this.authService.loggedIn('id_token')){
    //   console.log('is authorized..');
    //   this.isAuthorized = true;
    //   this.authService.getParty()
    //   .subscribe(res => {
    //     console.log(res);
    //     let id: number = 0;
    //     res.party.forEach(guest => {
    //       id++;
    //       guest.id = id;
    //     });
    //     this.party = res.party;
    //     this.guestService.setParty(this.party);
    //   });
      
    // }
    

    //if unauthorized
    // if(!this.isAuthorized){
    //   //get facebook login status
    //   this.authService.getLoginStatus()
    //   .then(res => {
    //     console.log('login status..');
    //     console.log(res);
    //     //if not authorized via facebook then open login dialog
    //     if(res==='not_authorized'){
    //       this.openDialog();
    //     } else {
    //       //get facebook profile info (name & email), find user, and set localstorage
    //       this.authService.getFBProfile()
    //       .then(res => {
    //         console.log('get fb profile..');
    //         console.log(res);

    //         this.guest.email = res.email;
    //         this.guest.unicorn = res.id;

    //         this.authService.loginCustom(this.guest)
    //         .subscribe(res => {
    //           console.log(res);
              
    //           if(res.success){
    //             this.authService.storeToken(res.token, res.guest);
    //             this.party = res.party;
    //             this.isAuthorized = true;
    //             this.actionButtonLabel = 'Success';
    //             this.snackbar.open('You are signed in', this.actionButtonLabel, this.config);
    //           } else {
    //             this.actionButtonLabel = 'Oops';
    //             this.snackbar.open(res.msg, this.actionButtonLabel, this.config);
    //             this.openDialog();
    //           }
    //         })
    //       });
    //     }
    //   });
    // }
  }

  openDialog(selectedDialog: string) {
    // console.log(this.party);
    let config: MdDialogConfig = { disableClose: true, data: {dialog: selectedDialog}};
    this.dialogRef = this.dialog.open(DialogComponent, config);
    this.dialogRef.afterClosed().takeUntil(this.ngUnsubscribe).subscribe(() => {
      this.dialogRef = null;
    });
    //   .subscribe()
    // this.dialogRef = this.dialog.open(LoginDialogComponent, config);

    // this.dialogRef.afterClosed().subscribe((party: GuestComponent[]) => {
    //   console.log('after closed..');
    //   console.log(party);
    //   console.log(this.party);
    //   let id: number = 0;
    //   if(party.length){
    //     party.forEach(guest => {
    //       id++;
    //       guest.id = id;
    //       console.log(guest);
    //     });
    //     this.party = party;
    //     this.guestService.setParty(this.party);
    //     console.log(this.party);
    //     this.dialogRef = null;
    //     if(localStorage.getItem('id_token') !== null){
    //       this.isAuthorized = this.authService.loggedIn('id_token');
    //     }
    //   }
    //   if(!this.isAuthorized){
    //     this.actionButtonLabel = 'Oops';
    //     this.snackbar.open('Please login to view details and RSVP', this.actionButtonLabel, this.config);
    //   } else {
    //     this.actionButtonLabel = 'Yeah';
    //     this.snackbar.open('Welcome to the fun zone!', this.actionButtonLabel, this.config);
    //   }
    // });
  }

  logout(){
    this.router.navigate(['/wedding'])
    this.authService.logout()
    this.isAuthorized = false
    this.openDialog('login')
    // this.party = [];
    this.actionButtonLabel = 'Bye'
        this.snackbar.open('Stop back for more fun', this.actionButtonLabel, this.config)
  }

  showGuestDetails(id: number){
    // this.showGuest = true;
    this.router.navigate(['/guest-detail', id]);
  }
  hideGuestDetails(){
    this.showGuest = false;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.watcher.unsubscribe();
  }

  loadMobileContent() { 
    // Do something special since the viewport is currently
    // using mobile display sizes
    this.sideNavMode = 'over';
    this.sideNavOpened = false;
  }
  loadDesktopContent() { 
    // Do something special since the viewport is currently
    // using mobile display sizes
    this.sideNavMode = 'side';
    this.sideNavOpened = true;
  }
}
