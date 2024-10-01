export interface QuestControl {
    record_id?: string,
    
    // quest_control?: string,
    // barthelseg_enabled?: string,
    // monitoring_enabled?: string,
    // facseg_enabled?: string,
    // neuroqol_enabled?: string,

    num_eva?: number,
    num_seguimiento?: number,
    num_barthelseg?: number,
    num_facseg?: number,
    num_neuroqol?: number,
    
    barthelseg_date_1?: number,
    monitoring_date_1?: number,
    facseg_date_1?: number,
    neuroqol_date_1?: number,
    
    control_cuestionarios_complete?: number
}