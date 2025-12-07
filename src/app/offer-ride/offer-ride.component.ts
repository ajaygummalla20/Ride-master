import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RideService } from '../services/ride.service';

@Component({
  selector: 'app-offer-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-ride.component.html',
  styleUrl: './offer-ride.component.css'
})
export class OfferRideComponent implements OnInit {
  rideOffer = {
    employeeId: '',
    vehicleType: '',
    vehicleNo: '',
    vacantSeats: null,
    time: '',
    pickupPoint: '',
    destination: ''
  };

  constructor(private router: Router, private rideService: RideService) {}

  ngOnInit() {
    // Check if page was refreshed - redirect to home
    if (performance.navigation.type === 1) { // TYPE_RELOAD = 1
      this.router.navigate(['/']);
      return;
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      const rideData = {
        employeeId: this.rideOffer.employeeId,
        vehicleType: this.rideOffer.vehicleType,
        vehicleNo: this.rideOffer.vehicleNo,
        vacantSeats: this.rideOffer.vacantSeats!,
        time: this.rideOffer.time,
        pickupPoint: this.rideOffer.pickupPoint,
        destination: this.rideOffer.destination
      };
      
      const rideId = this.rideService.addRide(rideData);
      console.log('Ride offer saved with ID:', rideId);
      
      alert('Ride offer submitted successfully!');
      this.resetForm();
      this.router.navigate(['/']);
    } else {
      alert('Please fill in all required fields.');
    }
  }

  resetForm() {
    this.rideOffer = {
      employeeId: '',
      vehicleType: '',
      vehicleNo: '',
      vacantSeats: null,
      time: '',
      pickupPoint: '',
      destination: ''
    };
  }

  isFormValid(): boolean {
    return !!(
      this.rideOffer.employeeId &&
      this.rideOffer.vehicleType &&
      this.rideOffer.vehicleNo &&
      this.rideOffer.vacantSeats &&
      this.rideOffer.time &&
      this.rideOffer.pickupPoint &&
      this.rideOffer.destination
    );
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
