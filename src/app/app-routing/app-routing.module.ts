import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeddingComponent } from '../wedding/wedding.component';
import { InviteComponent } from '../invite/invite.component';
import { RegistryComponent } from '../registry/registry.component';
import { RsvpComponent } from '../rsvp/rsvp.component';
import { GuestDetailComponent } from '../guest-detail/guest-detail.component';

import { AuthGuard } from '../guards/auth.guard';

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
    component: InviteComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'registry',
    component: RegistryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rsvp',
    component: RsvpComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'guest/:id',
    component: GuestDetailComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [WeddingComponent, InviteComponent, RegistryComponent, RsvpComponent];
