import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { WaitlistComponent } from './waitlist.component';

const routes: Routes = [
  {
    path: '',
    component: WaitlistComponent,
    data: {
      title: 'Waitlist'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaitlistRoutingModule {}
