import {
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter
} from "@angular/core";

@Component({
  selector: "number-stepper",
  template: `    
 <button mat-mini-fab type="button" click-stop-propagation [disabled]="modelValue <= minValue" (click)="updateModel(-1)">
    <h3>-</h3>
  </button>
  <mat-form-field class="pl-2 pr-2" style="width: 60px;" [ngClass]="{'mat-form-field-invalid': required && !modelValue}">
    <input  matInput value="1" class="h3" autocomplete="off" [ngModelOptions]="{standalone: true}" [(ngModel)]="modelValue" (ngModelChange)="modelChanged($event)">
  </mat-form-field>
  <button mat-mini-fab type="button" click-stop-propagation [disabled]="modelValue >= maxValue" (click)="updateModel(1)"> 
    <h3>+</h3>
  </button> 
 `,
  styleUrls: ["number-stepper.component.scss"]
})
export class NumberStepperComponent {
  @Input()
  modelValue: number;
  @Input()
  required: boolean = false;
  @Input()
  maxValue: number;
  @Input()
  minValue: number;
  @Input()
  step: number = 1;
  @Output()
  modelValueChange: EventEmitter<number> = new EventEmitter();

  modelChanged(val) {
    val = val.replace(/[^0-9]/g, "");
    if (val < this.minValue && val != "") {
      setTimeout(() => {
        this.modelValue = this.minValue;
        this.modelValueChange.emit(this.minValue);
      });
    } else if (val > this.maxValue) {
      setTimeout(() => {
        this.modelValue = this.maxValue;
        this.modelValueChange.emit(this.maxValue);
      });
    } else {
      this.modelValueChange.emit(val);
    }
  }
  updateModel(val) {
    let mVal = this.modelValue;
    this.modelValue = val === -1 ? +mVal - this.step : +mVal + this.step;
    this.modelValue =
      this.modelValue < this.minValue
        ? this.minValue
        : this.modelValue > this.maxValue
          ? this.maxValue
          : this.modelValue;
    this.modelValueChange.emit(this.modelValue);
  }

  @HostListener("keydown", ["$event"])
  keyDownEvent(event: KeyboardEvent) {
    if (
      event.key.length === 1 &&
      (event.which < 48 || event.which > 57) &&
      (event.which < 96 || event.which > 105)
    ) {
      event.preventDefault();
    }
  }
}
