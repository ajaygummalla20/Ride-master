import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RideService, RideOffer } from '../services/ride.service';

@Component({
  selector: 'app-find-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './find-ride.component.html',
  styleUrl: './find-ride.component.css'
})
export class FindRideComponent implements OnInit {
  availableRides: RideOffer[] = [];
  isLoading = false;
  bookingRideId: string | null = null;
  bookingEmployeeId = '';
  bookingError = '';

  constructor(private rideService: RideService, private router: Router) {}

  ngOnInit() {
    this.loadRides();
  }

  loadRides() {
    this.isLoading = true;
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.availableRides = this.rideService.getRidesSortedByTime();
      this.isLoading = false;
    }, 500);
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getVehicleIcon(vehicleType: string): string {
    return vehicleType === 'car' ? '🚗' : '🏍️';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openBookingModal(ride: RideOffer) {
    console.log('Opening booking modal for ride:', ride);
    this.bookingRideId = ride.id;
    this.bookingEmployeeId = '';
    this.bookingError = '';
  }

  onEmployeeIdChange() {
    // Clear error when user starts typing
    if (this.bookingError) {
      this.bookingError = '';
    }
  }

  closeBookingModal() {
    this.bookingRideId = null;
    this.bookingEmployeeId = '';
    this.bookingError = '';
  }

  confirmBooking() {
    console.log('Confirm booking called');
    console.log('Employee ID:', this.bookingEmployeeId);
    console.log('Ride ID:', this.bookingRideId);
    
    if (!this.bookingEmployeeId.trim()) {
      this.bookingError = 'Please enter your Employee ID';
      return;
    }

    if (this.bookingRideId) {
      const result = this.rideService.bookRide(this.bookingRideId, this.bookingEmployeeId.trim());
      console.log('Booking result:', result);
      
      if (result.success) {
        alert(result.message);
        this.loadRides(); // Refresh the rides list
        this.closeBookingModal();
      } else {
        this.bookingError = result.message;
      }
    } else {
      console.log('No booking ride ID found');
      this.bookingError = 'Something went wrong. Please try again.';
    }
  }

  canBookRide(ride: RideOffer): boolean {
    return ride.vacantSeats > 0;
  }

  isRideBooked(ride: RideOffer): boolean {
    return ride.vacantSeats === 0;
  }

  // Debugging method - can be removed later
  clearAllRides() {
    if (confirm('Are you sure you want to clear all rides? This is for testing purposes.')) {
      localStorage.removeItem('rideOffers');
      this.loadRides();
    }
  }
}