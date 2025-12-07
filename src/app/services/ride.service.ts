import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RideOffer {
  id: string;
  employeeId: string;
  vehicleType: string;
  vehicleNo: string;
  vacantSeats: number;
  time: string;
  pickupPoint: string;
  destination: string;
  createdAt: Date;
  bookedBy: string[]; // Array of employee IDs who booked this ride
}

export interface BookingResult {
  success: boolean;
  message: string;
  rideId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private rides: RideOffer[] = [];
  private ridesSubject = new BehaviorSubject<RideOffer[]>([]);
  public rides$ = this.ridesSubject.asObservable();

  constructor() {
    // Load rides from localStorage if available
    this.loadRidesFromStorage();
  }

  addRide(rideData: Omit<RideOffer, 'id' | 'createdAt' | 'bookedBy'>): string {
    const newRide: RideOffer = {
      ...rideData,
      id: this.generateId(),
      createdAt: new Date(),
      bookedBy: []
    };
    
    this.rides.push(newRide);
    this.saveRidesToStorage();
    this.ridesSubject.next([...this.rides]);
    
    return newRide.id;
  }

  bookRide(rideId: string, employeeId: string): BookingResult {
    console.log('BookRide called with:', { rideId, employeeId });
    console.log('Available rides:', this.rides);
    
    const ride = this.rides.find(r => r.id === rideId);
    
    if (!ride) {
      console.log('Ride not found');
      return { success: false, message: 'Ride not found.' };
    }

    console.log('Found ride:', ride);

    // Ensure bookedBy array exists (for backward compatibility)
    if (!ride.bookedBy) {
      ride.bookedBy = [];
    }

    // Check if booking employee is the same as ride owner
    if (ride.employeeId === employeeId) {
      console.log('Cannot book own ride');
      return { success: false, message: 'You cannot book your own ride.' };
    }

    // Check if employee has already booked this ride
    if (ride.bookedBy.includes(employeeId)) {
      console.log('Already booked by this employee');
      return { success: false, message: 'You have already booked this ride.' };
    }

    // Check if seats are available
    if (ride.vacantSeats <= 0) {
      console.log('No seats available');
      return { success: false, message: 'No seats available for this ride.' };
    }

    // Book the ride
    console.log('Booking ride...');
    ride.bookedBy.push(employeeId);
    ride.vacantSeats -= 1;

    this.saveRidesToStorage();
    this.ridesSubject.next([...this.rides]);

    console.log('Ride booked successfully. Updated ride:', ride);
    return { 
      success: true, 
      message: 'Ride booked successfully!', 
      rideId: rideId 
    };
  }

  hasUserBookedRide(rideId: string, employeeId: string): boolean {
    const ride = this.rides.find(r => r.id === rideId);
    return ride ? ride.bookedBy.includes(employeeId) : false;
  }

  canUserBookRide(rideId: string, employeeId: string): { canBook: boolean; reason?: string } {
    const ride = this.rides.find(r => r.id === rideId);
    
    if (!ride) {
      return { canBook: false, reason: 'Ride not found.' };
    }

    if (ride.employeeId === employeeId) {
      return { canBook: false, reason: 'You cannot book your own ride.' };
    }

    if (ride.bookedBy.includes(employeeId)) {
      return { canBook: false, reason: 'You have already booked this ride.' };
    }

    if (ride.vacantSeats <= 0) {
      return { canBook: false, reason: 'No seats available.' };
    }

    return { canBook: true };
  }

  getRides(): RideOffer[] {
    return [...this.rides];
  }

  getRidesSortedByTime(): RideOffer[] {
    return this.rides
      .filter(ride => new Date(ride.time) >= new Date()) // Only future rides
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  getRideById(id: string): RideOffer | undefined {
    return this.rides.find(ride => ride.id === id);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveRidesToStorage(): void {
    try {
      localStorage.setItem('rideOffers', JSON.stringify(this.rides));
    } catch (error) {
      console.error('Error saving rides to localStorage:', error);
    }
  }

  private loadRidesFromStorage(): void {
    try {
      const savedRides = localStorage.getItem('rideOffers');
      if (savedRides) {
        this.rides = JSON.parse(savedRides);
        
        // Migrate old data to include bookedBy array if missing
        this.rides = this.rides.map(ride => ({
          ...ride,
          bookedBy: ride.bookedBy || []
        }));
        
        console.log('Loaded rides from storage:', this.rides);
        this.ridesSubject.next([...this.rides]);
      }
    } catch (error) {
      console.error('Error loading rides from localStorage:', error);
      this.rides = [];
    }
  }
}