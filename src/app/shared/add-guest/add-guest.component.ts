import { Component, OnInit, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material";
import {
  GuestService,
  GuestDetailModel,
  SharedDataService,
  GuestDetails
} from "../../_services";
import * as _ from "underscore";
import { FilterPipe } from "../../_pipes";
import { InitializeService } from "../../_services/initialize.service";

@Component({
  selector: "add-guest",
  templateUrl: "add-guest.component.html",
  styleUrls: ["add-guest.component.scss"],
  providers: [FilterPipe]
})
export class AddPartyComponent implements OnInit {
  @Input()
  parent: string;
  guestModel: GuestDetailModel = new GuestDetailModel();
  notes: Array<any> = [];
  dataList: any[] = [];
  countries: any;
  codeValue: string = "1";
  invalidCountry: boolean = false;
  countryCode: string;
  changeInput: boolean = false;
  code: string;

  constructor(
    private guestService: GuestService,
    private shared: SharedDataService,
    private initialize : InitializeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.getSelectedCountryCode();
  }

  ngOnInit() {
    this.notes = this.guestService.getPreDefinedNotes();
    if (!this.notes.length) {
      this.getNotes();
    } else {
      this.updateNotesSelection();
    }
    this.data.guestModel.pagerNumber =
      this.data.guestModel.pagerNumber > 0
        ? this.data.guestModel.pagerNumber
        : null;
    this.guestModel = this.data.guestModel;
    this.guestModel.guest = this.data.guestModel.guest
      ? this.data.guestModel.guest
      : new GuestDetails();
  }

  getSelectedCountryCode() {
    this.initialize
      .getSelectedCountryCodes(this.shared.getClientID())
      .subscribe(data => {
        this.code = data;
        this.getCountryNames();
      });
  }

  getCountryNames() {
    this.code = this.code == null ? "+1" : this.code;
    let countryCode = this.guestModel.guest.countryCode
      ? this.guestModel.guest.countryCode
      : this.code;
    this.initialize.getCountryCodes().subscribe(data => {
      this.countries = data;
      let selCountry = _.findWhere(this.countries, {
        countryCode: countryCode
      });
      this.countryCode = selCountry.countryName;
      this.codeValue = selCountry.countryCode;
      this.data.guestModel.guest.countryCode = this.codeValue;
    });
  }

  //get country code
  getCountryCode() {
    var a = _.findWhere(this.countries, {
      countryName: this.countryCode
    });
    this.codeValue = a.countryCode;
    this.data.guestModel.guest.countryCode = this.codeValue;
  }

  //validate country
  validateCountry(country: string) {
    let selCountry = _.findWhere(this.countries, { countryName: country });
    this.data.guestModel.guest.countryCode = this.codeValue;
    this.invalidCountry = selCountry ? false : true;
  }

  updateNotesSelection() {
    var self = this;
    _.each(this.data.guestModel.notes.notes, function(n) {
      let selected = _.findWhere(self.notes, { id: n.id });
      if (selected) selected.selected = true;
    });
    this.selectedNotes();
  }

  //To get party list notes
  getNotes() {
    this.guestService.getNotes(this.shared.getClientID()).subscribe(data => {
      this.notes = data;
      this.updateNotesSelection();
    });
  }

  //fetch guest from the database if exists
  onBlurMethod() {
    let countryCode = parseInt(this.codeValue);
    this.guestService
      .getGuestNumber(this.guestModel.guest.phone, this.shared.getClientID(), countryCode)
      .subscribe(data => {
        if (data != 404) {
          this.guestModel.guest = data;
        } else {
          this.guestModel.guest.id =
            this.data.type == 2 && this.guestModel.guest.id
              ? this.guestModel.guest.id
              : "";
        }
      });
  }

  //selected notes
  selectedNotes() {
    this.data.guestModel.notes.notes = _.pluck(
      _.where(this.notes, { selected: true }),
      "id"
    );
  }

  clear(event) {
    if (event.target.value == 1 && this.data.type != 2) {
      this.data.guestModel.adultCovers = null;
    }
  }

  clearValue(event) {
    if (event.target.value == 0 && this.data.type != 2) {
      this.data.guestModel.childCovers = null;
    }
  }
}
