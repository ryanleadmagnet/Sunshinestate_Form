import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  console.log('--- KEY DEBUG ---');
  console.log('length:', rawKey.length);
  console.log('starts with quote?', rawKey.startsWith('"'));
  console.log('contains literal \\n?', rawKey.includes('\\n'));
  console.log('contains actual newline?', rawKey.includes('\n'));
  console.log('first 40 chars:', rawKey.substring(0, 40));
  console.log('last 40 chars:', rawKey.substring(Math.max(0, rawKey.length - 40)));
  
  return NextResponse.json({ success: true, message: 'Debug printed to console' });
}
