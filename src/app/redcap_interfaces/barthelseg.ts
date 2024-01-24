export interface Barthelseg {
    record_id?: string, 
    // redcap_repeat_instrument?: string,
    // redcap_repeat_instance?: number, 
    
    f_barthel?: string,
    barthel_1_s?: string,
    barthel_2_s?: string,
    barthel_3_s?: string,
    barthel_4_s?: string,
    barthel_5_s?: string,
    barthel_6_s?: string,
    barthel_7_s?: string,
    barthel_8_s?: string,
    barthel_9_s?: string,
    barthel_10_s?: string,
    barthel_score_s?: string,

    barthel786_uuid?: string,
    barthel786_startdate?: string,
    barthel786_enddate?: string,
    barthel786_scheduledate?: string,
    barthel786_status?: string,
    barthel786_supplementaldata?: string,
    barthel786_serializedresult?: string,

    barthelseg_complete?: string,
}