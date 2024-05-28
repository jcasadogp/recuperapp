import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { InformationComponent } from 'src/app/components/information/information.component';
import { EvaComponent } from 'src/app/components/eva/eva.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'information',
    component: InformationComponent
  },
  {
    path: 'eva',
    component: EvaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
