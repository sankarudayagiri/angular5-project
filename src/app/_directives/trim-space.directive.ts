import {
  Directive,
  ElementRef,
  HostListener,
  Input
} from "@angular/core";

@Directive({
  selector: "[trimSpace]"
})
export class TrimSpaceDirective {
  @Input()
  trimSpace: any;

  constructor(private el: ElementRef) {}

  @HostListener("keydown", ["$event"])
  keyDownEvent(event: KeyboardEvent) {
    if (event.key.length === 1 && event.which == 32) {
      event.preventDefault();
    }
    this.replaceSpace();
  }

  replaceSpace() {
    this.el.nativeElement.value = this.el.nativeElement.value.replace(
      /\s/g,
      ""
    );
  }
}
