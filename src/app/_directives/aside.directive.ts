import { Directive, HostListener, ElementRef } from '@angular/core';
import { NotesService } from '../notes/notes.service';
import { NotificationService } from '../notification/notification.service';

/**
* Allows the aside to be toggled via click.
*/
@Directive({
  selector: '[appAsideMenuToggler]',
})
export class AsideToggleDirective {

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    document.querySelector('body').classList.toggle('aside-menu-hidden');
  }
}

@Directive({
  selector: '[panelPinToggler]',
})
export class PanelPinToggler {

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    document.querySelector('body').classList.add('aside-menu-hidden');
  }
}

@Directive({
  selector: '[NotificationPanelToggler]',
})
export class NotificationPanelDirective {
  constructor(private eRef: ElementRef,public notificationService:NotificationService) { }

  @HostListener('document:click', ['$event'])
  clickout() {

    if (this.eRef.nativeElement.contains(event.target)) {
      document.getElementById('notification').classList.toggle('panelOpen');
    }

    else {
      document.getElementById('notification').classList.remove('panelOpen');
      this.notificationService.openNotificationPanel=false;

    }

  }
}

@Directive({
  selector: '[NotesPanelToggler]',
})
export class NotesPanelDirective {
  constructor(private eRef: ElementRef, public notesService: NotesService) { }

  @HostListener('document:click', ['$event'])
  clickout() {

    if (this.eRef.nativeElement.contains(event.target)) {
      document.getElementById('notes').classList.toggle('notesPanelOpen');
    }

    else {
      document.getElementById('notes').classList.remove('notesPanelOpen');
      this.notesService.openNotesPanel=false;
    }

  }
}
