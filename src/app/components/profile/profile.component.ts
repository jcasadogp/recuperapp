import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ParticipantDataForm } from 'src/app/interfaces/participant_data-form';
import { Participant, BaselineData } from 'src/app/redcap_interfaces/participant';
import { ParticipantService } from 'src/app/services/participant/participant.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent  implements OnInit {

  public id: number;
  // public participant: Participant = {};
  // public baselineData: BaselineData = {};

  // public participantDataJson;
  // public participantData: ParticipantDataForm = {}
  
  public participantData = {}
  public baselineData;

  constructor(
    private router: Router,
    private modalCntrl: ModalController,
    private participantSrvc: ParticipantService
  ) {
    this.id = 118
   }

  ngOnInit() {
    this.participantSrvc.getBasiLineDataJson().subscribe(data => {
      this.baselineData = data
      // console.log(this.baselineData)
    });
    this.getParticipant()
    this.getBaselineData()
  }

  getParticipant(){
    this.participantSrvc.getParticipant(this.id).subscribe({
      next: (data: Participant) => {
        this.participantData["firstname"] = data[0].f645_firstname
        this.participantData["lastname"] = data[0].f645_lastname
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {}
    })
  }

  getBaselineData(){
    this.participantSrvc.getBaselineData(this.id).subscribe({
      next: (data: BaselineData) => {
        
        // console.log("1", this.baselineData.filter(field => field.field_type === 'radio'|| field.field_type === 'dropdown'))
        // console.log("2", this.baselineData.filter(field => field.field_type === 'text'|| field.field_type === 'notes'))
        // console.log("3", this.baselineData.filter(field => field.field_type === 'checkbox'))

        // console.log(data)

        // console.log(this.baselineData[0])

        for(let i=0; i<this.baselineData.length; i++){
        // for(let i=16; i<17; i++){

          var bData = this.baselineData[i]

          if(bData.field_type == "radio" || bData.field_type == "dropdown"){

            var partValue = data[0][bData.redcap_value]
            bData = this.pickRadioAnswer(bData, partValue)

            if ('properties' in bData.answer){
              var new_bData = bData.answer.properties[0]

              if(new_bData.field_type == "radio" || bData.field_type == "dropdown") {

                var new_partValue = data[0][new_bData.redcap_value]
                new_bData = this.pickRadioAnswer(new_bData, new_partValue)
              
              } else if(new_bData.field_type == "text" || bData.field_type == "notes") {

                var new_partValue = data[0][new_bData.redcap_value]
                new_bData = this.pickTextAnswer(new_bData, new_partValue)

              } else if(new_bData.field_type == "checkbox"){
              }

              bData.answer.properties = new_bData

            }
          
          } else if(bData.field_type == "text" || bData.field_type == "notes"){
            
            var partValue = data[0][bData.redcap_value]
            bData = this.pickTextAnswer(bData, partValue)

          } else if(bData.field_type == "checkbox"){

            // console.log(bData.redcap_value)
            var matching_keys = Object.keys(data[0]).filter(key => key.startsWith(bData.redcap_value) && data[0][key] !== '0')
            // console.log(matching_keys)

            var matching_keys_values = matching_keys.map(key => {
              const lastDigits = key.match(/\d+$/);
              return lastDigits ? parseInt(lastDigits[0]) : null;
            });
            // console.log(matching_keys_values)

            console.log(bData)
            bData = this.pickCheckboxAnswer(bData, matching_keys_values)
          }
          // console.log(bData)
        }

      },
      error: (err) => console.log(err),
      complete: () => {}
    })
  }

  // Receives an object with several answers and returns the object with the picked answer
  pickRadioAnswer(baseline_data, selected_value){
    var selected_answer = baseline_data.answers.filter(answer => [selected_value].includes(String(answer.redcap_value)))[0]
    delete baseline_data.answers;
    baseline_data.answer = selected_answer
    return baseline_data
  }

  // Receives an object with an empty answer and returns the object with the value filled in
  pickTextAnswer(baseline_data, selected_value){
    baseline_data.answers = selected_value
    return baseline_data
  }

  // Receives an object with several answers and returns the object with the picked ones
  pickCheckboxAnswer(baseline_data, selected_values){
    var selected_answers = baseline_data.answers.filter(answer => selected_values.includes(answer.redcap_value))
    baseline_data.answers = selected_answers
    return baseline_data
  }

  
  
  
  dismissModal(): void {
		this.modalCntrl.dismiss().then().catch();
  }
}
