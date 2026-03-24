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
    // These environment variables need to be set in your .env.local or deployment platform
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !SPREADSHEET_ID) {
      console.warn('Google Sheets credentials not set. Logging data only.');
      return NextResponse.json({ success: true, message: 'Data logged to server (Sheet not configured)' });
    }

    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Assuming first sheet

    // 2. Prepare Row Data
    // Map the form IDs to your spreadsheet column headers
    const row = {
      Timestamp: new Date().toLocaleString(),
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
    };

    // 3. Append Row
    await sheet.addRow(row);
    console.log('Successfully added row to Google Sheet');

    return NextResponse.json({ success: true, message: 'Form submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting to spreadsheet:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
