export interface Facseg {
    record_id?: string, 
    redcap_repeat_instrument?: string,
    redcap_repeat_instance?: number, 
    
    f_facseg?: string,
    fac_seguimiento?: string,

    fac365_uuid?: string,
    fac365_startdate?: string,
    fac365_enddate?: string,
    fac365_scheduledate?: string,
    fac365_status?: string,
    fac365_supplementaldata?: string,
    fac365_serializedresult?: string,
    
    facseg_complete?: number
}