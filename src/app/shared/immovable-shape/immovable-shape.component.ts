import { Component, Input, OnChanges, SimpleChange } from "@angular/core";

@Component({
  selector: "[immovableVisual]",
  template: `
  <svg:g [attr.transform]="'rotate(' + immovable.rotation + ' ' + 0 + ' ' + 0 + ')'">
    <svg:rect *ngIf="immovable.shape == 1 || immovable.shape == 2"
      [attr.x]="0" 
      [attr.y]="0"
      [attr.class]="activeClass == 'active' ? 'svg-immovable active' : 'svg-immovable'" 
      [attr.width]="immovable.width"
      [attr.height]="immovable.height">
    </svg:rect>

    <svg:circle *ngIf="immovable.shape == 3"
      [attr.cx]="0" 
      [attr.cy]="0"
      [attr.r]="immovable.radius"
      [attr.class]="activeClass == 'active' ? 'svg-immovable active' : 'svg-immovable'">
    </svg:circle>

    <svg:text *ngIf="immovable.width > 20 && immovable.height > 20"
      [attr.x]="immovable.shape == 3 ? 0 : immovable.width / 2" 
      [attr.y]="immovable.shape == 3 ? 5 : immovable.height / 2 + 5" 
      [attr.text-anchor]="'middle'" 
      [attr.class]="activeClass == 'active' ? 'svg-immovable-text active' : 'svg-immovable-text'" 
      transform="rotate(0 34.5 52)">{{immovable.name}}
    </svg:text>
    </svg:g>
  `,
  styleUrls: ["./immovable-shape.component.scss"]
})
export class ImmovableVisualComponent implements OnChanges {
  @Input("immovableVisual")
  immovable: any;
  @Input("selectedClass")
  selectedClass: string;
  activeClass: string;

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.activeClass = changes.selectedClass
      ? changes.selectedClass.currentValue
      : "";
  }
}
