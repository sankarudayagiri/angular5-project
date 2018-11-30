import { Component, OnInit } from "@angular/core";
import { HelpService } from "./help.service";

@Component({
  selector: "app-help",
  templateUrl: "help.component.html",

  providers: [HelpService]
})
export class HelpComponent implements OnInit {
  helpData: any;
  constructor(private dataService: HelpService) {}

  ngOnInit() {
    this.getHelpFiles();
  }

  getHelpFiles() {
    this.dataService.getFiles().subscribe(data => {
      this.helpData = data;
    });
  }
}
