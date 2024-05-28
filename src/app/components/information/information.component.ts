import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent  implements OnInit {

  constructor(
    private modalCntrl: ModalController,
  ) { }

  ngOnInit() {}

  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }
}
