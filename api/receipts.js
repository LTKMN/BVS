import { getReceipts, addReceiptEntry } from '../utils/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const receipts = getReceipts();
    return res.status(200).json(receipts);
  }

  if (req.method === 'POST') {
    const success = await addReceiptEntry(req.body);
    if (success) {
      return res.status(200).json({ message: 'Entry added!' });
    }
    return res.status(500).json({ error: 'Failed to add entry' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}