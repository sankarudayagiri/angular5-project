import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChange
} from "@angular/core";

@Component({
  selector: "[tableView]",
  templateUrl: "./tableandchairs.component.html",
  styleUrls: ["./tableandchairs.component.scss"]
})
export class TableVisualComponent implements OnInit, OnChanges {
  @Input("tableView")
  table: any;
  @Input("selectedClass")
  selectedClass: string;
  @Input("multiSelectClass")
  multiSelectClass: string;
  @Input("tableError")
  tableError: boolean;
  @Input()
  parent: string;
  activeClass: string;
  tableErrorMessage: string;

  ngOnInit() {
    this.updateTableStatus();
  }

  updateTableStatus() {
    if (this.selectedClass) {
      if (this.table.tableStatus.id == "Blocked") {
        this.selectedClass = "Blocked";
      } else if (this.table.tableStatus.id == "Held") {
        this.selectedClass = "Held";
      } else if (this.table.tableStatus.id == "Available") {
        this.selectedClass = "Available";
      }
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes && changes.selectedClass) {
    }
    if (changes && changes.multiSelectClass) {
      this.multiSelectClass = changes.multiSelectClass.currentValue;
    }
    this.tableError = changes.tableError
      ? changes.tableError.currentValue
      : this.tableError;
    this.tableErrorMessage =
      changes.tableError && changes.tableError.currentValue
        ? "Table name already exists"
        : changes.tableError && !changes.tableError.currentValue
          ? ""
          : this.tableErrorMessage;
  }
}
