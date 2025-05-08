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

  /**
  * Handles modal dismissal.
  * 
  * - If the form is empty, dismisses the modal immediately.
  * - If the form contains data, prompts the user with a confirmation alert before closing.
  */
  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }
}
