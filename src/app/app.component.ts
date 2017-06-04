import { Component,OnInit } from '@angular/core';
import {MdIconRegistry,MdDialogRef, MdDialog, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import { FacebookService, InitParams, LoginResponse, UIParams, LoginOptions } from 'ngx-facebook';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';

import {GuestComponent} from './guest/guest.component';
import {GuestDetailComponent} from './guest-detail/guest-detail.component';
import {LoginDialogComponent} from './login-dialog/login-dialog.component';

import {AuthService} from './auth.service';
import {GuestService} from './guest.service';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  //title = 'Amanda & Luke are getting married!';
  fbLoginResponse: LoginResponse;
  guest: GuestComponent;
  party: GuestComponent[] = [];
  isAuthorized: Boolean = false;
  showGuest: Boolean = true;
  dialogRef: MdDialogRef<LoginDialogComponent>;
  config: MdSnackBarConfig;
  actionButtonLabel: string = '';

  title = 'Amanda & Luke\'s Wedding!';
  pages = [
    {
      name: 'Wedding',
      icon: 'svg-1',
      routerLink: '/wedding',
      routerLinkActive: true,
      active: true,
    },
    {
      name: 'Details',
      icon: 'svg-2',
      routerLink: '/details',
      routerLinkActive: true,
      active: this.isAuthorized,
    },
    {
      name: 'Registry',
      icon: 'svg-3',
      routerLink: '/registry',
      routerLinkActive: true,
      active: this.isAuthorized,
    },
    {
      name: 'RSVP',
      icon: 'svg-5',
      routerLink: '/rsvp',
      routerLinkActive: true,
      active: this.isAuthorized,
    },
  ];
  

  constructor(private iconRegistry: MdIconRegistry, private sanitizer: DomSanitizer, 
  private dialog: MdDialog, private authService:AuthService, public snackbar: MdSnackBar,
  private guestService: GuestService, private router: Router,  private route: ActivatedRoute) {
    this.guest = new GuestComponent();
  }

  ngOnInit(){
    this.showGuest = false;
    this.config = new MdSnackBarConfig();
    this.config.duration = 5000;
    
    this.getLoginStatus();

    // To avoid XSS attacks, the URL needs to be trusted from inside of your application.
    const iconsSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('./assets/icons.svg');
    this.iconRegistry.addSvgIconSetInNamespace('icons', iconsSafeUrl);

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
    console.log('get login status..');

    //if localStorage token exists, check if still valid
    if(this.authService.loggedIn('id_token')){
      console.log('is authorized..');
      this.isAuthorized = true;
      this.authService.getParty()
      .subscribe(res => {
        console.log(res);
        let id: number = 0;
        res.party.forEach(guest => {
          id++;
          guest.id = id;
        });
        this.party = res.party;
        this.guestService.setParty(this.party);
      });
      
    }
    

    //if unauthorized
    if(!this.isAuthorized){
      //get facebook login status
      this.authService.getLoginStatus()
      .then(res => {
        console.log('login status..');
        console.log(res);
        //if not authorized via facebook then open login dialog
        if(res==='not_authorized'){
          this.openDialog();
        } else {
          //get facebook profile info (name & email), find user, and set localstorage
          this.authService.getFBProfile()
          .then(res => {
            console.log('get fb profile..');
            console.log(res);

            this.guest.email = res.email;
            this.guest.unicorn = res.id;

            this.authService.loginCustom(this.guest)
            .subscribe(res => {
              console.log(res);
              
              if(res.success){
                this.authService.storeToken(res.token, res.guest);
                this.party = res.party;
                this.isAuthorized = true;
                this.actionButtonLabel = 'Success';
                this.snackbar.open('You are signed in', this.actionButtonLabel, this.config);
              } else {
                this.actionButtonLabel = 'Oops';
                this.snackbar.open(res.msg, this.actionButtonLabel, this.config);
                this.openDialog();
              }
            })
          });
        }
      });
    }
  }

  openDialog() {
    console.log(this.party);
    let config: MdDialogConfig = { data: this.party};
    this.dialogRef = this.dialog.open(LoginDialogComponent, config);

    this.dialogRef.afterClosed().subscribe((party: GuestComponent[]) => {
      console.log('after closed..');
      console.log(party);
      console.log(this.party);
      let id: number = 0;
      if(party.length){
        party.forEach(guest => {
          id++;
          guest.id = id;
          console.log(guest);
        });
        this.party = party;
        this.guestService.setParty(this.party);
        console.log(this.party);
        this.dialogRef = null;
        if(localStorage.getItem('id_token') !== null){
          this.isAuthorized = this.authService.loggedIn('id_token');
        }
      }
      if(!this.isAuthorized){
        this.actionButtonLabel = 'Oops';
        this.snackbar.open('Please login to view details and RSVP', this.actionButtonLabel, this.config);
      } else {
        this.actionButtonLabel = 'Yeah';
        this.snackbar.open('Welcome to the fun zone!', this.actionButtonLabel, this.config);
      }
    });
  }

  logout(){
    this.authService.logout();
    this.isAuthorized = false;
    this.party = [];
    this.actionButtonLabel = 'Bye';
        this.snackbar.open('Stop back for more fun', this.actionButtonLabel, this.config);
  }

  showGuestDetails(id: number){
    // this.showGuest = true;
    this.router.navigate(['/guest-detail', id]);
  }
  hideGuestDetails(){
    this.showGuest = false;
  }
}
