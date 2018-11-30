import { Component, OnInit } from "@angular/core";

import { MatDialogRef } from "@angular/material";
import { AlertService, LoaderService } from "../../_services";
import { JtechAdminService } from "../../super-admin/search/search.service";
import { ClientLocation } from "../../super-admin/search/search.models";
import { DatePipe } from "@angular/common";

@Component({
  templateUrl: "./add-client-location.component.html",
  providers: [JtechAdminService, AlertService]
})
export class AddClientLocationComponent {
  clientLocationData: ClientLocation = new ClientLocation();
  matCustomError: string;
  errorMessages: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddClientLocationComponent>,
    private DataService: JtechAdminService,
    private alert: AlertService,
    private loaderService: LoaderService,
    private datePipe: DatePipe
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  createLocation() {
    this.clientLocationData.CurrentDateTimeOffset = this.datePipe.transform(
      new Date(),
      "ZZZZZ"
    );
    console.log(this.clientLocationData);
    this.loaderService.showLoader(true);
    this.DataService.createLocation(this.clientLocationData).subscribe(
      data => {
        this.alert.success("New Location is added Successfully.");
        this.loaderService.showLoader(false);
        this.dialogRef.close(data);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alert.error(error.error.message);
      }
    );
  }
}
