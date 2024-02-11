import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BarthelsegComponent } from 'src/app/components/barthelseg/barthelseg.component';
import { FacsegComponent } from 'src/app/components/facseg/facseg.component';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.page.html',
  styleUrls: ['./quests.page.scss'],
})
export class QuestsPage implements OnInit {

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
  ) { }

  ngOnInit() {
  }

  async presentFacsegModal(){
    const modal = await this.modalCntrl.create({
      component: FacsegComponent
    });
    return await modal.present();
  }

  async presentBarthelsegModal(){
    const modal = await this.modalCntrl.create({
      component: BarthelsegComponent
    });
    return await modal.present();
  }

}
