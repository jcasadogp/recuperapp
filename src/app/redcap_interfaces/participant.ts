export interface Participant {
    record_id?: number,
    redcap_repeat_instrument?: string,
    redcap_repeat_instance?: number,

    f645_firstname?: string,
    f645_lastname?: string,
    f645_zerodate?: string,
    dispositivo?: string,
    email?: string,
    f645_code?: string,
    f645_joindate?: string,
    f645_pushids?: string,

    participantes_complete?: number,
}