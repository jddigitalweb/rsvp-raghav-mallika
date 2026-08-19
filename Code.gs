function doGet() {
  return ContentService
    .createTextOutput("Raghav & Mallika RSVP Backend is Working")
    .setMimeType(ContentService.MimeType.TEXT);
}

const SHEET_NAME = "RSVP Responses";

function doPost(e){
  try{
    const p=e&&e.parameter?e.parameter:{};
    if(p.website) return response({ok:false,message:"spam"});

    const ss=SpreadsheetApp.getActiveSpreadsheet();
    let sheet=ss.getSheetByName(SHEET_NAME);
    if(!sheet) sheet=ss.insertSheet(SHEET_NAME);

    const headers=[
      "Timestamp","RSVP","Name","Phone","Date of Arrival","Time of Arrival",
      "Date of Departure","Coming From","Mode of Transport",
      "Mayra Lunch","Sangeet","Haldi","Reception","Breakfast"
    ];

    if(sheet.getLastRow()===0){
      sheet.appendRow(headers);
      sheet.getRange(1,1,1,headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      p.rsvp||"",
      p.name||"",
      p.phone||"",
      p.arrival||"",
      p.time||"",
      p.departure||"",
      p.from||"",
      p.transport||"",
      p.mayra==="Yes"?"Yes":"No",
      p.sangeet==="Yes"?"Yes":"No",
      p.haldi==="Yes"?"Yes":"No",
      p.reception==="Yes"?"Yes":"No",
      p.breakfast==="Yes"?"Yes":"No"
    ]);

    return response({ok:true});
  }catch(err){
    return response({ok:false,message:String(err)});
  }
}

function response(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
