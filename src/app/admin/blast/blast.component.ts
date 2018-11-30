import { Component } from "@angular/core";
import { BlastData, BlastService } from "./blast.service";
import { AlertService, SharedDataService, TimeZoneService } from "../../_services";

@Component({
  selector: "app-blast",
  templateUrl: "blast.component.html",
  styleUrls: ["blast.component.scss"],
  providers: [BlastService]
})
export class BlastComponent {
  public exportTime: Date = new Date();
  minDate: Date;
  errorTime: boolean = false;
  blastData: BlastData = new BlastData();
  selectedDate: Date;
  selectedtime: any;
  constructor(
    private blastService: BlastService,
    private alertService: AlertService,
    private shared: SharedDataService,
    public tzone: TimeZoneService,
  ) {
    this.exportTime = this.tzone.getClientDateTimeWithLTZone(new Date());
    this.selectedDate = this.tzone.getClientDateTimeWithLTZone(new Date());
    this.minDate = this.tzone.getClientDateTimeWithLTZone(new Date());
  }

  convertDate() {
    var time = this.exportTime.toTimeString();
    var date = this.selectedDate.toDateString();
    var dt = date + "," + time;
    this.blastData.whenDatetime = new Date(dt);
  }

  checktime() {
    this.convertDate();
    let currentTime = this.tzone.getClientDateTimeWithLTZone(new Date()).getTime();
    let selectedTime = this.blastData.whenDatetime.getTime();
    this.errorTime = currentTime > selectedTime ? true : false;
  }

  //to create blast
  createBlast() {
    this.convertDate();
    this.blastData.clientID = this.shared.getClientID();

    if (this.blastData.whenBlast == 1) {
      this.blastData.whenDatetime = this.tzone.getClientDateTimeWithLTZone(
        new Date()
      );
    }

    this.blastService.createBlast(this.blastData).subscribe(
      data => {
        this.blastData.whenBlast == 1
          ? this.alertService.success("Message sent successfully.")
          : this.alertService.success("The message scheduled to be sent later is saved successfully.");
         this.blastData.textMessage=' ';
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  //to update the current time when later option is choosed
  updateCurrentTime() {
    this.exportTime = this.tzone.getClientDateTimeWithLTZone(new Date());
    this.selectedDate = this.tzone.getClientDateTimeWithLTZone(new Date());
  }

  //to check the max length of text area
  maxlength(event) {
    if (event.target.value.length === 128) event.preventDefault();
  }
}
