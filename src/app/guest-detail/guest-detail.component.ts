import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {GuestService} from '../services/guest.service';
import * as moment from 'moment';
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

  constructor(private guestService: GuestService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      if (params['id'] !== undefined) {
        let id = params['id']
        // this.navigated = true;
        this.guestService.getGuest(id)
          .subscribe(guest => {
            this.guest = guest
            console.log(this.guest)
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
          })
      } 
    })
  }
}
