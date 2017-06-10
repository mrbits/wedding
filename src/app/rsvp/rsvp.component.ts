import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';

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

  constructor(private guestService: GuestService, private authService: AuthService) { }

  ngOnInit() {
    this.guestService.getParty()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(party => {this.party = party; console.log(this.party)})
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  saveRsvp (guest: Guest) {
    this.authService.updateGuest(guest)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        console.log(res)
        if (res.success) {
          //profile update saved successfully
        }
      })
  }

  oldSave () {
    console.log('proud of you')
  }

}
