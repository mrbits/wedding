import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {Guest} from '../guest';

import {GuestService} from '../services/guest.service';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html',
  styleUrls: ['./rsvp.component.css']
})
export class RsvpComponent implements OnInit {

  party: Guest[]
  private ngUnsubscribe: Subject<void> = new Subject<void>()

  snackbarConfig: MdSnackBarConfig
  snackbarLabel: string = ''

  constructor(private guestService: GuestService, private authService: AuthService, public snackbar: MdSnackBar) { }

  ngOnInit() {
    this.guestService.getParty()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(party => {this.party = party; console.log(this.party)})

    this.snackbarConfig = new MdSnackBarConfig();
    this.snackbarConfig.duration = 5000;

    this.party.forEach(guest => {
      if (new Date(guest.rsvpDate) < new Date(2017,5,1)) {
        guest.rsvpDate = new Date()
        this.authService.updateGuest(guest)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(res => {
            console.log(res)
          })
      }
    })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  saveRsvp (guest: Guest, rsvpUpdate: Boolean, mealUpdate: Boolean) {
    if (rsvpUpdate) {
      guest.rsvpDate = new Date()
    }
    if (mealUpdate) {
      guest.mealOptionDate = new Date()
    }
    this.authService.updateGuest(guest)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        console.log(res)
        if (res.success) {
          this.snackbar.open(res.msg, res.title, this.snackbarConfig)
        }
      })
  }

  oldSave () {
    this.snackbar.open('Proud of you', 'Great Job', this.snackbarConfig)
  }

}
