import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
  selector: "[decimal]"
})
export class DecimalDirective {
  elemRef: ElementRef;

  constructor(private el: ElementRef) {
    this.elemRef = el;
  }

  @Input()
  OnlyNumber: boolean;
  @Input()
  DecimalPlaces: string;
  @Input()
  minValue: string;
  @Input()
  maxValue: string;

  @HostListener("keydown", ["$event"])
  onKeyDown(event) {
    const e = event as KeyboardEvent;
    if (this.OnlyNumber) {
      if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        (e.keyCode == 65 && e.ctrlKey) ||
        (e.keyCode == 67 && e.ctrlKey) ||
        (e.keyCode == 88 && e.ctrlKey) ||
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    }
  }

  @HostListener("keypress", ["$event"])
  onKeyPress(event) {
    const e = event as any;
    const valInFloat = parseFloat(e.target.value);

    // if(this.minValue.length) {
    //   if( valInFloat < parseFloat(this.minValue) || (isNaN(valInFloat) && e.key === "0") ) {
    //     e.preventDefault();
    //   }
    // }

    if (this.maxValue.length) {
      if (valInFloat > parseFloat(this.maxValue)) {
        e.preventDefault();
      }
    }

    if (this.DecimalPlaces) {
      let currentCursorPos = -1;
      if (typeof this.elemRef.nativeElement.selectionStart == "number") {
        currentCursorPos = this.elemRef.nativeElement.selectionStart;
      }

      const dotLength: number = e.target.value.replace(/[^\.]/g, "").length;
      const decimalLength = e.target.value.split(".")[1] ? e.target.value.split(".")[1].length : 0;

      if (dotLength > 1 ||
        (dotLength === 1 && e.key === ".") ||
        (decimalLength > (parseInt(this.DecimalPlaces) - 1) &&
          currentCursorPos > e.target.value.indexOf(".")) &&
        ["Backspace", "ArrowLeft", "ArrowRight"].indexOf(e.key) === -1) {
        e.preventDefault();
      }
    }
  }
}
