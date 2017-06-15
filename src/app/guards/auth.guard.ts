import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate{
  constructor(private authService:AuthService, private router:Router){

  }

  canActivate(){
    console.log(this.router)

    if(this.authService.loggedIn('id_token')){
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}