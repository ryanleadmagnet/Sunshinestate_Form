import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log for debugging
    console.log('--- NEW FORM SUBMISSION ---');
    console.log(data);

    // 1. Setup Google Auth
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    console.log('Key Status:', rawKey ? `Present (length: ${rawKey.length})` : 'Missing');
    
    // Robust parsing for different quote/escaped-newline scenarios and invisible DOS/Windows characters
    const formattedKey = rawKey
      ?.replace(/^"|"$/g, '')      // Safely remove surrounding quotes even across multi-line
      ?.replace(/\\n/g, '\n')     // Replace literal \n with real newline just in case
      ?.replace(/\\r/g, '')       // Replace literal \r 
      ?.replace(/\r/g, '')        // Strip actual invisible carriage returns (OpenSSL 3.x crasher)
      ?.trim();                   // Remove trailing spaces or empty newlines

    const GOOGLE_PRIVATE_KEY = formattedKey;
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !SPREADSHEET_ID) {
      const missing = [];
      if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
      if (!GOOGLE_PRIVATE_KEY) missing.push('GOOGLE_PRIVATE_KEY');
      if (!SPREADSHEET_ID) missing.push('GOOGLE_SHEET_ID');
      
      console.error('Missing credentials on Vercel:', missing);
      return NextResponse.json(
        { success: false, message: `Configuration error: Missing credentials - [ ${missing.join(', ')} ]` }, 
        { status: 500 }
      );
    }

    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    
    await doc.loadInfo();
    
    // Select the specifically named tab "GetSolar"
    const sheet = doc.sheetsByTitle['GetSolar'];
    
    if (!sheet) {
      console.error('Tab "GetSolar" not found in spreadsheet.');
      return NextResponse.json({ success: false, message: 'Worksheet "GetSolar" not found.' }, { status: 404 });
    }

    // 2. Prepare Row Data
    const row = {
      Timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      Residency: data.residency || '',
      HomeAge: data.age || '',
      ExistingSolar: data.existing_solar || '',
      Shading: data.shading || '',
      Usage: data.usage || '',
      PowerBill: data.bill || '',
      SystemSize: data.size || '',
      Battery: data.battery || '',
      Postcode: data.postcode || '',
      FirstName: data.firstName || '',
      LastName: data.lastName || '',
      Email: data.email || '',
      Phone: data.phone || '',
      Platform: data.platform || '', // Capture the new UTM parameter
    };

    // 3. Append Row
    await sheet.addRow(row);
    console.log('Successfully added row to GetSolar sheet');

    return NextResponse.json({ success: true, message: 'Form submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting to spreadsheet:', error);
    
    // Check if it's the specific OpenSSL Decoder error caused by Vercel environment formatting
    if (error.message && error.message.includes('DECODER routines')) {
      const dbgKey = process.env.GOOGLE_PRIVATE_KEY || "";
      const parsed = dbgKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\r/g, '').trim();
      
      const debugInfo = `Raw Length: ${dbgKey.length} | Parsed starts with: ${parsed.substring(0, 31)} | Parsed ends with: ${parsed.substring(Math.max(0, parsed.length - 28))}`;
      
      return NextResponse.json({ 
        success: false, 
        message: `Vercel PEM Key Error (DECODER unsupported). Please check your key formatting in Vercel settings. Debug info: ${debugInfo}` 
      }, { status: 500 });
    }

    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
