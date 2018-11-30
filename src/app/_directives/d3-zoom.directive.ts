import { Directive, Input, ElementRef, OnInit } from "@angular/core";
import { D3TableService } from "../_services/";

@Directive({
  selector: '[zoomableOf]'
})
export class D3ZoomableDirective implements OnInit {
  @Input('zoomableOf') zoomableOf: ElementRef;

  constructor(private d3Service: D3TableService, private element: ElementRef) {}

  ngOnInit() {
      this.d3Service.applyZoomableBehaviour(this.zoomableOf, this.element.nativeElement);
  }
}
