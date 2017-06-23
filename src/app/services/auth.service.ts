import { Injectable } from '@angular/core'
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map'
import {tokenNotExpired} from 'angular2-jwt'

import {GuestService} from './guest.service'

@Injectable()
export class AuthService {

  authToken: any
  guest: any
  isDev:boolean

  constructor(private http: Http, private guestService: GuestService) { this.isDev = true }
  
  registerUser (guest){
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/register')
    return this.http.post(ep, guest,{headers: headers})
      .map(res => res.json())
  }

  authenticateUser (email: String, password: String){
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/authenticate')
    return this.http.post(ep, {email: email, unicorn: password },{headers: headers})
      .map(res => {
        console.log(res.json())
        if (res.json().success) {
          console.log('success..')
          this.guestService.setParty(res.json().guests)
        }
        console.log('return res.json()..')
        return res.json()   
      })
  }

  authenticateFacebookUser (facebookId: String) {
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/authenticate-facebook')
    return this.http.post(ep, {facebookId: facebookId },{headers: headers})
      .map(res => {
        console.log(res.json())
        if (res.json().success) {
          console.log('success..')
          this.guestService.setParty(res.json().guests)
        }
        console.log('return res.json()..')
        return res.json()   
      })
  }

  getProfile (){
    let headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/profile')
    return this.http.get(ep,{headers: headers})
      .map(res => {
        if (res.json().success) {
          console.log(res.json().guests)
          this.guestService.setParty(res.json().guests)
        }
        return res.json()
      })
  }

  storeUserData (token, party){
    localStorage.setItem('id_token', token)
    this.authToken = token
  }

  loadToken (){
    const token = localStorage.getItem('id_token')
    this.authToken = token
  }

  loggedIn (token: string){
    return tokenNotExpired(token)
  }

  logout (){
    this.authToken = null
    this.guestService.setParty([])
    localStorage.clear()
  }

  getPartyFromValue (email?: String, firstName?: String, lastName?: String, facebookId?: String){
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/find')
    return this.http.post(ep, {email: email, firstName: firstName, lastName: lastName, facebookId: facebookId}, {headers: headers})
      .map(res => res.json())
  }

  updateGuest (guest) {
    let headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/update')
    return this.http.post(ep, guest, {headers: headers})
      .map(res => {
        if (res.json().success) {
          console.log(res.json().guest)
          this.guestService.setGuest(res.json().guest)
        }
        return res.json()
      })
  }

  prepEndpoint (ep){
    return '/' + ep
    // if (this.isDev){
      // return 'http://localhost:3000/'+ep
    // } else {
    //   // return 'http://localhost:8080/'+ep
    // }
  }

  resetPassword (email: String) {
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/forgot')
    return this.http.post(ep, {email: email}, {headers: headers})
      .map(res => {
        return res.json()
      })
  }

  checkEmail (email: String) {
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/validate-email')
    return this.http.post(ep, {email: email}, {headers: headers})
      .map(res => {
        return res.json()
      })
  }

  setPassword (password: String, token: String) {
    let headers = new Headers()
    headers.append('Content-Type','application/json')
    let ep = this.prepEndpoint('api/guest/reset/' + token)
    return this.http.post(ep, {password: password}, {headers: headers})
      .map(res => {
        return res.json()
      })
  }
}
