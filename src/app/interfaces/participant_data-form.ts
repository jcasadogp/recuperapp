export interface ParticipantDataForm {
    // Participantes in RedCAP
    firstname?: string,
    lastname?: string,
    
    // Datos Basales in RedCAP
    sexo?: string,
    edad?: string,
    e_civil?: string,

    enf_previas?: string[]
    
    ocd?: string,
    caidas?: string,
    gds?: string,
    ub_basal?: string,
    ay_basal?: string,

    f_basales?: string,
    f_basales_tipo?: string[]
    
    f_ingreso?: string,
    f_cirug_a?: string,
    tipo_fractura?: string,
    fx_asociada?: string,
    tipo_cirugia?: string,
    asa?: string,

    ret_qx?: string,
    // motivo_ret_qx?: string,
    
    compl_intrahosp?: string,
    compl_intrahosp_tipo?: string[]
    // comp_intrahosp_otras?: string,
    
    carga_alta?: string,
    destino_alta?: string,
    // causa_exitus_intrahosp?: string,
    rehab_alta?: string,
    comentarios?: string
}
