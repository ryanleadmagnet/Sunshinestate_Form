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
    
    // Robust parsing for different quote/escaped-newline scenarios
    const formattedKey = rawKey
      ?.replace(/^"(.*)"$/, '$1') // Remove surrounding quotes if they exist
      ?.replace(/\\n/g, '\n');   // Replace literal \n with real newline

    const GOOGLE_PRIVATE_KEY = formattedKey;
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !SPREADSHEET_ID) {
      console.error('Missing credentials:', { 
        email: !!GOOGLE_SERVICE_ACCOUNT_EMAIL, 
        key: !!GOOGLE_PRIVATE_KEY, 
        sheet: !!SPREADSHEET_ID 
      });
      return NextResponse.json({ success: false, message: 'Configuration error: Missing credentials.' }, { status: 500 });
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
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
