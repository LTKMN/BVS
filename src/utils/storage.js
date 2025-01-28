// utils/storage.js
import fs from 'fs';
import path from 'path';

const RECEIPT_FILE = path.join(process.cwd(), 'public', 'receipt.json');

// Initialize the file if it doesn't exist
if (!fs.existsSync(RECEIPT_FILE)) {
  fs.writeFileSync(RECEIPT_FILE, JSON.stringify({ entries: [] }));
}

export const getReceipts = () => {
  try {
    const data = fs.readFileSync(RECEIPT_FILE, 'utf8');
    return JSON.parse(data).entries;
  } catch (error) {
    console.error('Error reading receipts:', error);
    return [];
  }
};

export const addReceiptEntry = async (entry) => {
  try {
    const data = fs.readFileSync(RECEIPT_FILE, 'utf8');
    const receipts = JSON.parse(data);
    receipts.entries.unshift({
      ...entry,
      timestamp: Date.now(),
      id: Date.now().toString()
    });
    fs.writeFileSync(RECEIPT_FILE, JSON.stringify(receipts, null, 2));
    return true;
  } catch (error) {
    console.error('Error adding receipt entry:', error);
    return false;
  }
};