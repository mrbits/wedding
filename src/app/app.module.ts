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
import { DialogComponent } from './dialog/dialog.component';
import { InviteComponent } from './invite/invite.component';
import { RegistryComponent } from './registry/registry.component';
import { RsvpComponent } from './rsvp/rsvp.component';
import { GuestDetailComponent } from './guest-detail/guest-detail.component';
import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent,
    WeddingComponent,
    DialogComponent,
    InviteComponent,
    RegistryComponent,
    RsvpComponent,
    GuestDetailComponent
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
  providers: [AuthService, GuestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
