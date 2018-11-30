import "rxjs/add/observable/of";
import { Injectable } from "@angular/core";
import { Subject} from "rxjs";

@Injectable()
export class UpdateResultsService {
  private updateWaitListResults = new Subject<boolean>();
  private updateReservationResults = new Subject<boolean>();
  private updateFloorPlanResults = new Subject<boolean>();
  private updateAvailableTimeSlots = new Subject<boolean>();
  private updateNotificationResults = new Subject<boolean>();
  private updateSeatedGuestsResults = new Subject<boolean>();
  private updatePagerResults = new Subject<boolean>();
  private updateBadgeCountResults = new Subject<boolean>();

  updateWaitlist$ = this.updateWaitListResults.asObservable();
  updateReservation$ = this.updateReservationResults.asObservable();
  updateTimeSlots$ = this.updateAvailableTimeSlots.asObservable();
  updateFloorPlan$ = this.updateFloorPlanResults.asObservable();
  updateNotifications$ = this.updateNotificationResults.asObservable();
  updateSeatedGuests$ = this.updateSeatedGuestsResults.asObservable();
  updatePager$ = this.updatePagerResults.asObservable();
  updateBadgeCount$ = this.updateBadgeCountResults.asObservable();
  

  updateWaitlist(update: boolean) {
    this.updateWaitListResults.next(update);
  }

  updateReservations(update: boolean) {
    this.updateReservationResults.next(update);
  }

  updateTimeSlots(update: boolean) {
    this.updateAvailableTimeSlots.next(update);
  }

  updateFloorPlan(update: boolean) {
    this.updateFloorPlanResults.next(update);
    this.updateSeatedGuestsResults.next(update);
  }

  updateNotifications(update: boolean) {
    this.updateNotificationResults.next(update);
  }
  updatePagers(update: boolean) {
    this.updatePagerResults.next(update);
  }

  updateBadgeCount(update: boolean) {
    this.updateBadgeCountResults.next(update);
  }

  
}
