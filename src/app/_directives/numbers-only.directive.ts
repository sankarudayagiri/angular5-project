import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter
} from "@angular/core";

@Directive({
  selector: "[numbersOnly]"
})
export class NumbersOnlyDirective {
  @Input()
  numbersOnly: any;
  @Input()
  input: any;
  @Input()
  allowComma: boolean = false;
  @Output()
  inputChange: EventEmitter<Date> = new EventEmitter();

  constructor(private el: ElementRef) {}

  @HostListener("keydown", ["$event"])
  keyDownEvent(event: KeyboardEvent) {
    if (event.shiftKey) {
      event.preventDefault();
    } else if (this.allowComma) {
      if (
        event.key &&
        event.key.length === 1 &&
        (event.which < 48 || event.which > 57) &&
        (event.which < 96 || event.which > 105) &&
        (event.which <= 86 || event.which > 86) &&
        (event.which <= 67 || event.which > 67) &&
        (event.which <= 65 || event.which > 65) &&
        (event.which < 188 || event.which > 188)
      ) {
        event.preventDefault();
      }
    } else if (
      event.key &&
      event.key.length === 1 &&
      (event.which < 48 || event.which > 57) &&
      (event.which < 96 || event.which > 105) &&
      (event.which <= 86 || event.which > 86) &&
      (event.which <= 67 || event.which > 67) &&
      (event.which <= 65 || event.which > 65)
    ) {
      event.preventDefault();
    }
  }
}
