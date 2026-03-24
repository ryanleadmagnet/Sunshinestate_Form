import { config } from 'dotenv';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

config({ path: '.env.local' });

async function test() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  console.log('Raw key length:', rawKey ? rawKey.length : 0);
  console.log('Starts with quote?', rawKey?.startsWith('"'));
  
  const formattedKey = rawKey
    ?.replace(/^"(.*)"$/, '$1')
    ?.replace(/\\n/g, '\n');

  console.log('Starts with BEGIN?', formattedKey?.startsWith('-----BEGIN PRIVATE KEY-----'));
  console.log('Ends with END?', formattedKey?.trim().endsWith('-----END PRIVATE KEY-----'));

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  
  try {
    await doc.loadInfo();
    console.log('Successfully loaded doc info:', doc.title);
    const sheet = doc.sheetsByTitle['GetSolar'];
    if (sheet) {
      console.log('Found GetSolar sheet, adding test row...');
      await sheet.addRow({ Timestamp: new Date().toISOString() });
      console.log('Test row added.');
    } else {
      console.log('GetSolar sheet not found. Available sheets:', Object.keys(doc.sheetsByTitle));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
