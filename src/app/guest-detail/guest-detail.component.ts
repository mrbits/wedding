import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {GuestService} from '../services/guest.service';

import {Guest} from '../guest';

@Component({
  selector: 'app-guest-detail',
  templateUrl: './guest-detail.component.html',
  styleUrls: ['./guest-detail.component.css']
})
export class GuestDetailComponent implements OnInit {
  
  guest: Guest

  constructor(private guestService: GuestService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      if (params['id'] !== undefined) {
        let id = params['id']
        // this.navigated = true;
        this.guestService.getGuest(id)
          .subscribe(guest => this.guest = guest)
      } 
    })
  }
}
