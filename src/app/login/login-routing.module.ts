import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPage } from './login.page';
import { TabsPage } from '../tabs/tabs.page';

const routes1: Routes = [
  {
    path: '',
    component: LoginPage
  }
];

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },{
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'quests',
        loadChildren: () => import('../pages/quests/quests.module').then(m => m.QuestsPageModule)
      },
      {
        path: 'results',
        loadChildren: () => import('../pages/results/results.module').then(m => m.ResultsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
