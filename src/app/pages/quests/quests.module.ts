import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestsPageRoutingModule } from './quests-routing.module';

import { QuestsPage } from './quests.page';
import { FacsegComponent } from 'src/app/components/facseg/facseg.component';
import { BarthelsegComponent } from 'src/app/components/barthelseg/barthelseg.component';
import { MonitoringComponent } from 'src/app/components/monitoring/monitoring.component';
import { NeuroQolComponent } from 'src/app/components/neuro-qol/neuro-qol.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuestsPageRoutingModule
  ],
  declarations: [QuestsPage, MonitoringComponent, FacsegComponent, BarthelsegComponent, NeuroQolComponent]
})
export class QuestsPageModule {}
