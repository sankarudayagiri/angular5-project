import { Directive, Input, ElementRef, OnInit } from "@angular/core";
import { D3TableService } from "../_services/";

@Directive({
  selector: "[resizeHandle]"
})
export class D3ResizeDirective implements OnInit {
  @Input("resizeHandle") draggableNode: any;
  @Input("resizableNode") resizableNode : any;

  constructor(
    private d3Service: D3TableService,
    private element: ElementRef
  ) {}

  ngOnInit() {
    this.d3Service.applyResizableBehaviour(
      this.element.nativeElement,
      this.draggableNode,
      this.resizableNode
    );
  }
}
