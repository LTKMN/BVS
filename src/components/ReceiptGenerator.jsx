import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Utility functions
const generateTransactionId = () => Math.floor(1000 + Math.random() * 9000);
const generateCashierId = () => String(Math.floor(10000 + Math.random() * 90000)).padStart(8, '0');
const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const generateBarcode = () => Array(20).fill(0).map(() => Math.floor(Math.random() * 10)).join('');

const ReceiptGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Initial load
    fetchReceipts();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchReceipts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipts');
      const data = await response.json();
      setItems(data);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  const generateCoupon = async () => {
    // This would be your Claude API call for coupon generation
    // Prompt: "Generate a silly product name and tagline for a CVS coupon. Response should be in format: PRODUCT NAME | TAGLINE"
    const sampleResponse = "Quantum Floss 5000 | For when your teeth exist in multiple dimensions simultaneously";
    const [product, tagline] = sampleResponse.split('|').map(s => s.trim());
    
    return {
      type: 'coupon',
      product,
      tagline,
      discount: `$${(Math.random() * 5 + 1).toFixed(2)} off`,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      barcode: generateBarcode(),
      couponCode: Math.floor(10000 + Math.random() * 90000)
    };
  };

  const addToReceipt = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      // Claude API call for item transformation
      // Prompt: "here is some input text, take what the object is and spin it into a silly version of itself in a few words..."
      const sillyTransformation = "PLACEHOLDER FOR CLAUDE API RESPONSE";
      
      const newItem = {
        id: items.length,
        type: 'item',
        originalText: inputText,
        transformedText: sillyTransformation,
        time: formatTime(),
        date: formatDate(),
        transactionId: generateTransactionId(),
        cashierId: generateCashierId(),
        barcode: generateBarcode()
      };

      // Randomly decide to add a coupon (30% chance)
      const shouldAddCoupon = Math.random() < 0.3;
      if (shouldAddCoupon) {
        const coupon = await generateCoupon();
        await addReceiptEntry(coupon);
        await addReceiptEntry(newItem);
      } else {
        await addReceiptEntry(newItem);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInputText('');
      setIsLoading(false);
    }
  };

  const renderEntry = (entry) => {
    if (entry.type === 'coupon') {
      return (
        <div className="border-t border-b border-dashed py-4 animate-slideDown">
          <div className="text-center space-y-2">
            <div className="text-xl font-bold">{entry.discount}</div>
            <div className="text-lg">{entry.product}</div>
            <div className="text-sm italic">{entry.tagline}</div>
            <div className="text-xs">Expires {entry.expires}</div>
            <div className="barcode" style={{
              fontFamily: '"Libre Barcode 128", cursive',
              fontSize: '42px'
            }}>
              {entry.barcode}
            </div>
            <div className="text-xs">CPN#{entry.couponCode}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-dashed pt-4 mb-4 animate-slideDown">
        <div className="flex justify-between text-sm mb-2">
          <div>Reg#{entry.transactionId}</div>
          <div>CSHR#{entry.cashierId}</div>
        </div>
        <div className="text-center mb-1 text-sm italic text-gray-500">"{entry.originalText}"</div>
        <div className="text-center mb-2 font-bold">→ {entry.transformedText}</div>
        <div className="text-xs flex justify-between">
          <div>{entry.date}</div>
          <div>{entry.time}</div>
        </div>
        <div className="barcode text-center" style={{
          fontFamily: '"Libre Barcode 128", cursive',
          fontSize: '42px'
        }}>
          HelloCVS{entry.id}
        </div>
        <div className="text-center text-sm">{entry.barcode}</div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-md mx-auto mb-4 space-y-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={100}
          placeholder="Add something to your receipt..."
          className="w-full"
        />
        <Button 
          onClick={addToReceipt}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add to Receipt!
        </Button>
      </div>

      <div className="container relative">
        <div className="receipt" style={{
          width: '300px',
          margin: '0 auto',
          backgroundColor: '#fff',
          boxShadow: '5px 5px 19px #ccc',
          padding: '10px',
          fontFamily: '"VT323", monospace'
        }}>
          <h1 className="logo text-center text-2xl p-5">CVS/pharmacy</h1>
          <div className="address text-center mb-2">
            666 Lincoln St. Santa Monica, CA
          </div>

          {items.map((item, index) => (
            <div key={`${item.type}-${item.id}`}>
              {renderEntry(item)}
            </div>
          ))}

          <div className="text-center text-sm mt-4">
            ***********************************
            <br />
            Share your receipt thoughts at
            <br />
            www.CVSHealthSurvey.com
            <br />
            ***********************************
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ReceiptGenerator;