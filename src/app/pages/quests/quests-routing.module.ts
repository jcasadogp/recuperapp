import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuestsPage } from './quests.page';
import { FacsegComponent } from 'src/app/components/facseg/facseg.component';
import { BarthelsegComponent } from 'src/app/components/barthelseg/barthelseg.component';

const routes: Routes = [
  {
    path: '',
    component: QuestsPage
  },
  // {
  //   path: 'monitoring',
  //   component: 
  // },
  {
    path: 'barthelseg',
    component: BarthelsegComponent
  },
  {
    path: 'facseg',
    component: FacsegComponent
  }
  // ,
  // {
  //   path: 'neuro_qol',
  //   component: 
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestsPageRoutingModule {}
