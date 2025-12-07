import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OfferRideComponent } from './offer-ride/offer-ride.component';
import { FindRideComponent } from './find-ride/find-ride.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'offer-ride', component: OfferRideComponent },
  { path: 'find-ride', component: FindRideComponent },
  { path: '**', redirectTo: '' } // Wildcard route - redirects everything else to home
];
