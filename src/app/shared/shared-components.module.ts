import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

//third paprty
import { DragScrollModule } from "ngx-drag-scroll";
import { MaterialModule } from "../material.module";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { TabsModule } from "ngx-bootstrap";
import { RouterModule } from "@angular/router";

//components
import {
  AddPartyComponent,
  AddClientLocationComponent,
  ImmovableVisualComponent,
  ConfirmDialog,
  DiscardChangesDialog,
  MatCustomErrorComponent,
  NotesReminderDialogComponent,
  NumberStepperComponent,
  SelectFloorPlanComponent,
  SelectFloorPlanBtnComponent,
  SelectTableComponent,
  SetUpComponent,
  TimePickerComponent,
  ViewTabsComponent,
  TableVisualComponent,
  WidgetLoaderComponent
} from "./index";

//directives
import {
  NumbersOnlyDirective,
  TrimSpaceDirective,
  DecimalDirective,
  NotesPanelDirective,
  NotificationPanelDirective
} from "../_directives";

//pipes
import { FilterPipe } from "../_pipes";

//modules
import { MaterialTimeControlModule } from "./time-picker/material-time-control.module";

@NgModule({
  declarations: [
    NumberStepperComponent,
    NumbersOnlyDirective,
    AddPartyComponent,
    TimePickerComponent,
    ViewTabsComponent,
    ImmovableVisualComponent,
    TableVisualComponent,
    NotesPanelDirective,
    NotificationPanelDirective,
    DiscardChangesDialog,
    ConfirmDialog,
    AddClientLocationComponent,
    SelectFloorPlanComponent,
    SelectFloorPlanBtnComponent,
    SelectTableComponent,
    TrimSpaceDirective,
    MatCustomErrorComponent,
    FilterPipe,
    DecimalDirective,
    NotesReminderDialogComponent,
    WidgetLoaderComponent,
    SetUpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MaterialTimeControlModule,
    TabsModule,
    RouterModule,
    DragScrollModule
  ],
  exports: [
    NumberStepperComponent,
    NumbersOnlyDirective,
    TrimSpaceDirective,
    FormsModule,
    RouterModule,
    MaterialModule,
    MaterialTimeControlModule,
    ReactiveFormsModule,
    AddPartyComponent,
    ReactiveFormsModule,
    TimePickerComponent,
    ViewTabsComponent,
    ImmovableVisualComponent,
    TableVisualComponent,
    NotesPanelDirective,
    NotificationPanelDirective,
    DiscardChangesDialog,
    ConfirmDialog,
    SelectFloorPlanBtnComponent,
    SelectTableComponent,
    MatCustomErrorComponent,
    FilterPipe,
    DecimalDirective,
    NotesReminderDialogComponent,
    DragScrollModule,
    WidgetLoaderComponent,
    SetUpComponent
  ],
  entryComponents: [
    NumberStepperComponent,
    AddPartyComponent,
    TimePickerComponent,
    ViewTabsComponent,
    ImmovableVisualComponent,
    TableVisualComponent,
    DiscardChangesDialog,
    ConfirmDialog,
    AddClientLocationComponent,
    SelectFloorPlanComponent,
    SelectTableComponent,
    MatCustomErrorComponent,
    NotesReminderDialogComponent,
    SetUpComponent
  ]
})
export class SharedComponentsModule {}
