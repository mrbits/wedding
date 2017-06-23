import { Injectable } from '@angular/core'
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map'
import {tokenNotExpired} from 'angular2-jwt'

import {BehaviorSubject} from "rxjs/BehaviorSubject"

import { Guest } from '../guest'

import {AuthService} from './auth.service'

@Injectable()
export class GuestService {
  isDev: boolean
  endpoint: string = '/api/guest'
  // endpoint: string = 'http://localhost:3000/api/guest'
  private party$ = new BehaviorSubject<any>([])

  constructor(private http: Http) { }

  getParty () {
    return this.party$.asObservable()
  }

  getGuest (id: String) {
    return this.party$.asObservable()
            .map(res => res.filter((guest: Guest) => guest._id == id)[0] as Guest)
  }

  getPartyFromValue (email?: String, firstName?: String, lastName?: String, facebookId?: String){
    let headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post(this.endpoint + '/find', {email: email, firstName: firstName, lastName: lastName, facebookId: facebookId}, {headers: headers})
      .map(res => res.json())
  }
  
  setParty (party: Guest[]){
    this.party$.next(party)
  }

  setGuest (guest: Guest) {
    this.party$.asObservable().forEach(g => {
      console.log(g._id)
      console.log(guest._id)
      if (g._id === guest._id) {
        console.log('match ..')
        g = guest
      }
    })
  }
}
