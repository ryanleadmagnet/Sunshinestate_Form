import fs from 'fs';

const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
const keyLine = lines.find(l => l.startsWith('GOOGLE_PRIVATE_KEY='));
const rawKey = keyLine.substring('GOOGLE_PRIVATE_KEY='.length);

console.log('rawKey starts with: ', rawKey.substring(0, 10));
console.log('rawKey includes \\n: ', rawKey.includes('\\n'));
console.log('rawKey includes actual new lines: ', rawKey.includes('\n'));
console.log('rawKey starts with ": ', rawKey.startsWith('"'));
console.log('rawKey ends with ": ', rawKey.endsWith('"'));

console.log('Length:', rawKey.length);
