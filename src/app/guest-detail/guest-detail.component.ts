import { Component, OnInit, OnDestroy } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MdIconRegistry,MdDialogRef, MdDialog, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

import {GuestService} from '../services/guest.service';
import {DialogComponent} from '../dialog/dialog.component';
import {Guest} from '../guest';

@Component({
  selector: 'app-guest-detail',
  templateUrl: './guest-detail.component.html',
  styleUrls: ['./guest-detail.component.css']
})
export class GuestDetailComponent implements OnInit {

  guest: Guest
  inviteText: string = 'Invite--Denied!'
  rsvpText: string = 'Can you make it?'
  mealOptionText: string = 'Pick your dish!'
  inviteDate: string = ''
  rsvpDate: string = ''
  mealOptionDate: string = ''
  dialogRef: MdDialogRef<DialogComponent>
  private ngUnsubscribe: Subject<void> = new Subject<void>()

  constructor(private guestService: GuestService, private router: Router, private route: ActivatedRoute, private dialog: MdDialog) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      if (params['id'] !== undefined) {
        let id = params['id']
        // this.navigated = true;
        this.guestService.getGuest(id)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(guest => {
            this.guest = guest
            console.log(this.guest)
            if (this.guest !== undefined) {
              this.inviteDate = moment(this.guest.inviteDate).format('MM-DD-YYYY')
              this.rsvpDate = moment(this.guest.rsvpDate).format('MM-DD-YYYY')
              this.mealOptionDate = moment(this.guest.mealOptionDate).format('MM-DD-YYYY')
              if (this.inviteDate !== '') {
                if (this.guest.invite) {
                  this.inviteText = 'Digitally Received'
                }
              }
              if (this.rsvpDate != '') {
                if (this.guest.rsvp) {
                  this.rsvpText = 'Going'
                } else {
                  this.rsvpText = 'Not Going'
                }
              }
            }
          })
      } 
    })
  }

  getRsvp () {
    this.router.navigate(['/rsvp']);
  }

  getProfileDialog () {
    // console.log(this.party);
    let config: MdDialogConfig = { disableClose: true, data: {dialog: 'profile', guest: this.guest}};
    this.dialogRef = this.dialog.open(DialogComponent, config);
    this.dialogRef.afterClosed().takeUntil(this.ngUnsubscribe).subscribe(() => {
      this.dialogRef = null;
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }
}
