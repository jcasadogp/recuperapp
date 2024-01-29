export interface Login {
    record_id?: number,
    // redcap_repeat_instrument?: string,
    // redcap_repeat_instance?: number,
    
    contrasena?: string,
    contrasena_2?: string,
    
    num_eva?: number,
    num_seguimiento?: number,
    num_barthelseg?: number,
    num_facseg?: number,
    num_neuro_qol?: number,

    login_complete?: number,
}