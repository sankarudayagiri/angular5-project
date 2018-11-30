import { Component, Input } from "@angular/core";

@Component({
  selector: "widget-loader",
  template: `
  <div class="loader-overlay" *ngIf="overlay"></div>    
  <div class="spinner widget-loader" [ngClass]="module">
    <small class="text-extra-muted d-block text-uppercase">{{text}}</small>
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
  </div>
 `,
 styleUrls:['widget-loader.component.scss']
})
export class WidgetLoaderComponent {
  @Input()
  text: string;
  @Input()
  module: string;
  @Input() overlay : boolean = false;
}
