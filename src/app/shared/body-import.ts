import { REDCAP_TOKEN } from '../../../env.local';

export var BODYIMPORT = new URLSearchParams();
    BODYIMPORT.append("token", REDCAP_TOKEN);
    BODYIMPORT.append("content", "record");
    BODYIMPORT.append("format", "json");
    BODYIMPORT.append("type", "flat");

    BODYIMPORT.append("overwriteBehavior", "normal")
    BODYIMPORT.append("forceAutoNumber", "false")
    BODYIMPORT.append("returnContent", "count");
    
    BODYIMPORT.append("returnFormat", "json");


// action: import
// data: 