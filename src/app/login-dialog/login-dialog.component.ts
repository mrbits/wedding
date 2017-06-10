import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
// import { FormsModule } from '@angular/forms';
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {AuthService} from '../services/auth.service';

@Component({
  selector: 'login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent  {
  @Output() onGoBack = new EventEmitter<String>()
  @Output() onLogin = new EventEmitter<any>()

  selectedValue: string 
  constructor() { }
  // constructor(public dialogRef: MdDialogRef<LoginDialogComponent>) { }

  ngOnInit() {
    console.log('on init.')
  }

  getDialog(option: any) {
    console.log('get dialog..')
    console.log(option.value)
    this.onGoBack.emit(option.value)
    // if (option.value === 'forgot') {
    //   //open forgot dialog
    //   // this.onGoBack.emit('forgot')
    // } else if (option.value === 'create') {
    //   //open create dialog

    // }
  }

  loginWithFacebook() {

  }
  
  loginCustom(email: String, password: String) {
    console.log('login custom..')
    console.log(email)
    console.log(password)

    this.onLogin.emit({email: email, password: password})

    // this.authService.authenticateUser(email, password)
    //   .subscribe(res => {
    //     if (res.success) {
    //       console.log('success..')
    //       console.log(res)
    //       this.authService.storeUserData(res.token, res.guests)
    //       this.dialogRef.close()
    //     } else {
    //       console.log('error..')
    //       console.log(res)
    //     }
    //   })
  }
}
