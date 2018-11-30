import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output
} from "@angular/core";
import {
  SharedDataService
} from "../../_services/index";
import {
  MAT_DIALOG_DATA
} from "@angular/material";
import {
  WaitlistService,
  ChangeWaitlistModel,
  WaitlistModel
} from "../waitlist.service";

@Component({
  selector: "select-waitlist",
  templateUrl: "./select-wait-list.component.html",
  styleUrls: ["./select-wait-list.component.scss"],
  providers: [WaitlistService]
})
export class SelectWaitlistComponent implements OnInit {
  @Input() selectedID: string;
  guestChangeModel: ChangeWaitlistModel = new ChangeWaitlistModel();
  waitlistModel: WaitlistModel = new WaitlistModel();
  waitlistTypes: any[] = [];

  @Output() selectedIDChange: EventEmitter<string> = new EventEmitter();

  constructor(
    private waitlistService: WaitlistService,
    private shared: SharedDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.getChangeWaitList();
  }

  getChangeWaitList() {
    let d = new Date();
    this.guestChangeModel.fromDate = new Date(d.setHours(0, 0, 0, 0));
    this.guestChangeModel.toDate = new Date(d.setHours(24, 0, 0, 0));
    this.guestChangeModel.clientID = this.shared.getClientID();
    this.waitlistService
      .getChangeWaitList(this.guestChangeModel)
      .subscribe(data => {
        this.waitlistTypes = data;
      });
  }

  selectWaitList(list: any) {
    this.data.selectedWaitlistName = list.waitListName;
    this.selectedIDChange.emit(list.waitListID);
  }
}
