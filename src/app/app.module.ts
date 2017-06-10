import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AppRoutingModule } from './app-routing/app-routing.module';

import { AppComponent } from './app.component';
import { WeddingComponent } from './wedding/wedding.component';

import { AuthService } from './services/auth.service';
import { GuestService } from './services/guest.service';
import { ValidateService } from './services/validate.service';
import { InviteComponent } from './invite/invite.component';
import { RegistryComponent } from './registry/registry.component';
import { RsvpComponent } from './rsvp/rsvp.component';
import { GuestDetailComponent } from './guest-detail/guest-detail.component';
import 'hammerjs';
import { DialogComponent } from './dialog/dialog.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog/forgot-password-dialog.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { FindDialogComponent } from './find-dialog/find-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    WeddingComponent,
    InviteComponent,
    RegistryComponent,
    RsvpComponent,
    GuestDetailComponent,
    DialogComponent,
    LoginDialogComponent,
    ForgotPasswordDialogComponent,
    ProfileDialogComponent,
    FindDialogComponent
    // routedComponents
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    AppRoutingModule
  ],
  entryComponents: [DialogComponent, LoginDialogComponent, ForgotPasswordDialogComponent, ProfileDialogComponent, FindDialogComponent],
  providers: [AuthService, GuestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
