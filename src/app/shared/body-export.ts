import { REDCAP_TOKEN } from '../../../env.local'; 

export var BODYEXPORT = new URLSearchParams();
    BODYEXPORT.append("token", REDCAP_TOKEN);
    BODYEXPORT.append("content", "record");
    BODYEXPORT.append("action", "export");
    BODYEXPORT.append("format", "json");
    BODYEXPORT.append("type", "flat");

    BODYEXPORT.append("rawOrLabel", "raw");
    BODYEXPORT.append("rawOrLabelHeaders", "raw");
    BODYEXPORT.append("exportCheckboxLabel", "true");
    BODYEXPORT.append("exportSurveyFields", "false");
    BODYEXPORT.append("exportDataAccessGroups", "false");
    
    BODYEXPORT.append("returnFormat", "json");

// action: export
// csvDelimiter: 
// records: 1
// exportCheckboxLabel: false
