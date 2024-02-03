import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { InformationComponent } from 'src/app/components/information/information.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { Participant } from 'src/app/redcap_interfaces/participant';
import { ParticipantService } from 'src/app/services/participant/participant.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public id: number;
  public participant: Participant = {};
  public currentDate: string;

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
    private participantSrvc: ParticipantService
  ) {
    this.id = 118
    this.currentDate = new Date().toLocaleDateString('es-ES', {day: '2-digit',month: 'long',year: 'numeric'})
  }

  ngOnInit() {
    this.getParticipant(null)
  }

  getParticipant(event){
    this.participantSrvc.getParticipant(this.id).subscribe({
      next: (data: Participant) => {
        this.participant = data[0];
        if (event) event.target.complete();
      },
      error: (err) => {
        console.log(err)
        if (event) event.target.complete();
      },
      complete: () => {}
    })
  }

  async presentProfileModal(){
    const modal = await this.modalCntrl.create({
      component: ProfileComponent
    });
    return await modal.present();
  }

  async presentInformationModal(){
    const modal = await this.modalCntrl.create({
      component: InformationComponent
    });
    return await modal.present();
  }

  
  
  
  
  
  logout(){
    this.router.navigateByUrl('login')
  }


}
