import { Component, OnInit } from '@angular/core';

import {Guest} from '../guest';

import {GuestService} from '../services/guest.service';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html',
  styleUrls: ['./rsvp.component.css']
})
export class RsvpComponent implements OnInit {

  party: Guest[]
  constructor(private guestService: GuestService) { }

  ngOnInit() {
    this.guestService.getParty()
      .subscribe(party => {this.party = party; console.log(this.party)})
  }

}
