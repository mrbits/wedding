import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeddingComponent } from '../wedding/wedding.component';
import { InviteComponent } from '../invite/invite.component';
import { RegistryComponent } from '../registry/registry.component';
import { RsvpComponent } from '../rsvp/rsvp.component';
import { GuestDetailComponent } from '../guest-detail/guest-detail.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/wedding',
    pathMatch: 'full'
  },
  {
    path: 'wedding',
    component: WeddingComponent
  },
  {
    path: 'invite',
    component: InviteComponent
  },
  {
    path: 'registry',
    component: RegistryComponent
  },
  {
    path: 'rsvp',
    component: RsvpComponent
  },
  {
    path: 'guest/:id',
    component: GuestDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [WeddingComponent, InviteComponent, RegistryComponent, RsvpComponent];
