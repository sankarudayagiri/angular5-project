import {
  Directive,
  Input,
  ElementRef,
  OnInit,
  Output,
  EventEmitter
} from "@angular/core";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";

@Directive({
  selector: "[newObject]"
})
export class D3MouseEnterDirective implements OnInit {
  @Input()
  newObject: any;
  @Input()
  zoomValue: number;
  @Output()
  newObjectChange: EventEmitter<any> = new EventEmitter();

  constructor(private element: ElementRef) {}

  ngOnInit() {
    var self = this;
    let containerheight;
    let containerWidth;
    const offsetLeft = 60;
    const offsetTop = 60;
    const _ele = this.element.nativeElement.parentNode;

    function updateContainerValues() {
      containerheight = _ele.clientHeight;
      containerWidth = _ele.clientWidth;
    }

    function emitObjectDropChange(e: any, type) {
      const z = self.zoomValue;
      e = type == "touch" ? e.changedTouches[0] : e;

      const boundryPos = {
        x: e.clientX - offsetLeft,
        y: e.clientY - offsetTop
      };

      const pos = {
        x: Math.round((e.clientX - offsetLeft) / z),
        y: Math.round((e.clientY - offsetTop) / z)
      };

      if (
        boundryPos.x < containerWidth &&
          boundryPos.x > 10 &&
          (boundryPos.y < containerheight && boundryPos.y > 10)
      ) {
        self.newObject.coords = pos;
        self.newObjectChange.emit(self.newObject);
      }
    }

    updateContainerValues();

    Observable.fromEvent(document.body, "mouseup").subscribe(e => {
      emitObjectDropChange(e, "mouse");
    });

    Observable.fromEvent(document.body, "touchend").subscribe(e => {
      emitObjectDropChange(e, "touch");
    });

    Observable.fromEvent(window, "resize").subscribe(e => {
      updateContainerValues();
    });
  }
}
