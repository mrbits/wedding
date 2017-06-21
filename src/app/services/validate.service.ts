import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  

  // validateGuest (guest, isRegistration) {
  //   if(guest.firstName == undefined || guest.lastName == undefined || guest.email == undefined || (guest.unicorn == undefined && isRegistration)){
  //     return false
  //   } else {
  //     if (this.validateEmail(guest.email)) {
  //       return true
  //     } else {
  //       return false
  //     }
  //   }
  // }

  // validateEmail(email){
  //   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   return re.test(email)
  // }
}