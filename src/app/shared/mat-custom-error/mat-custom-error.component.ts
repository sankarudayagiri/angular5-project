import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChange,
  OnInit
} from "@angular/core";
import * as _ from "underscore";

@Component({
  selector: "mat-custom-error",
  template: `    
  <div class="help-block custom-validator text-danger"*ngIf="matCustomError">
    <small *ngIf="!customMessage">{{matCustomError}}</small>
    <small *ngIf="customMessage">{{customMessage}}</small>
  </div>
 `,
})
export class MatCustomErrorComponent implements OnInit {
  @Input()
  field: string;
  @Input()
  customMessage: string;
  @Input()
  errorData: string;
  @Input()
  matCustomError: string;
  @Output()
  matCustomErrorChange: EventEmitter<string> = new EventEmitter();

  ngOnInit() {}

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (
      changes.errorData &&
      changes.errorData.currentValue &&
      changes.errorData.currentValue.length
    ) {
      let error = _.findWhere(this.errorData, {
        field: this.field
      });
      this.matCustomError = error ? error.message : null;
      setTimeout(() => {
        this.matCustomErrorChange.emit(this.matCustomError);
      }, 100);
    }
  }
}
