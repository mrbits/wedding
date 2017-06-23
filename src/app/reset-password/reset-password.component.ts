import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  password: String = ''
  confirmPassword: String = ''
  resetPasswordFormControl: FormControl
  snackbarConfig: MdSnackBarConfig
  snackbarLabel: string = ''
  // resetConfirmPasswordFormControl: FormControl

  constructor (private authService: AuthService, private route: ActivatedRoute, private router: Router, public snackbar: MdSnackBar) { }

  ngOnInit () {
    this.resetPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(8)])
    // this.resetConfirmPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), this.checkPasswords.bind(this)])
    this.resetPasswordFormControl.valueChanges
        .subscribe(() => { 
          console.log('do..')
          this.checkPasswords()
        })

    this.snackbarConfig = new MdSnackBarConfig();
    this.snackbarConfig.duration = 5000;
  }

  setPassword () {
    console.log('password', this.password)
    if (this.checkPassword) {
      this.route.params.forEach((params: Params) => {
        if (params['token'] !== undefined) {
          let token = params['token']
          this.authService.setPassword(this.password, token)
            .subscribe(res => {
              console.log(res)
              this.snackbar.open(res.msg, res.title, this.snackbarConfig)
              if (res.success) {
                this.authService.authenticateUser(res.email, this.password)
                  .subscribe(res => {
                    console.log(res)
                    if (res.success) {
                      this.authService.storeUserData(res.token, res.guests)
                    } 
                    // this.snackbar.open(res.msg, res.title, this.snackbarConfig)
                    this.router.navigate(['/wedding'])
                    // this.router.
                  })
              }
            })
        }
      })
    }
  }

  checkPassword () {
    if (this.resetPasswordFormControl.valid) {
      return true
    } else {
      return false
    }
  }

  checkPasswords () {
    console.log('password', this.password)
    console.log('confirm password', this.confirmPassword)
    if (this.password === undefined || this.confirmPassword === undefined || this.password === this.confirmPassword) {
      // console.log('undefined')
      // return null
      if (this.resetPasswordFormControl.errors != null) delete this.resetPasswordFormControl.errors.emailInvalid
    } else {
      this.resetPasswordFormControl.setErrors({'passwordInvalid':true})
      // console.log('not undefined')
      // console.log(fieldControl.value === this.guest.unicorn ? null : {NotEqual: true})
      // return password === confirmPassword ? null : { NotEqual: true }
    }
  }

}
