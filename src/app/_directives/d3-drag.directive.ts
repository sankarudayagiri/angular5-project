import {
  Directive,
  Input,
  ElementRef,
  OnInit,
  SimpleChange
} from "@angular/core";
import { D3TableService } from "../_services/";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";

@Directive({
  selector: "[draggableNode]"
})
export class D3DragDirective implements OnInit {
  @Input()
  zoomValue: number;
  @Input("draggableNode")
  draggableNode: any;
  @Input("resizingHandle")
  resizingHandle: any;

  constructor(
    private d3Service: D3TableService,
    private _element: ElementRef
  ) {
  }

  ngOnInit() {
    this.updateContainerValues();

    Observable.fromEvent(window, "resize").subscribe(e => {
      this.updateContainerValues();
    });
  }

  updateContainerValues() {
    const ele = this._element.nativeElement;
    if (ele && ele.viewportElement) {
      let boundryEle: any = {};
      boundryEle = {
        x: ele.viewportElement.parentNode.clientWidth,
        y: ele.viewportElement.parentNode.clientHeight - 4
      };
      const handleEle = ele.nextElementSibling;
      this.d3Service.applyDraggableBehaviour(
        ele,
        this.draggableNode,
        this.resizingHandle,
        handleEle,
        boundryEle,
        this.zoomValue
      );
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.zoomValue) {
      this.zoomValue = changes.zoomValue.currentValue;
      this.updateContainerValues();
    }
  }
}
