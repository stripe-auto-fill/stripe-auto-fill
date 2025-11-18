importScripts('constants.js');

function cleanBin(bin) {
  return bin.replace(/x/gi, '').replace(/\s+/g, '').trim();
}

function luhnCheck(cardNumber) {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

function calculateLuhnCheckDigit(partial) {
  let sum = 0;
  let isEven = true;
  
  for (let i = partial.length - 1; i >= 0; i--) {
    let digit = parseInt(partial[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return (10 - (sum % 10)) % 10;
}

function generateCardWithLuhn(bin) {
  let cardNumber = bin;
  
  while (cardNumber.length < 15) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  cardNumber += checkDigit;
  
  return cardNumber;
}

function generateCardsWithLuhn(bin, quantity) {
  const cards = [];
  
  for (let i = 0; i < quantity; i++) {
    const cardNumber = generateCardWithLuhn(bin);
    const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const expYear = String(currentYear + Math.floor(Math.random() * 5) + 1);
    const cvv = String(Math.floor(Math.random() * 900) + 100);
    
    cards.push({
      serial_number: i + 1,
      card_number: cardNumber,
      expiry_month: expMonth,
      expiry_year: expYear,
      cvv: cvv,
      full_format: `${cardNumber}|${expMonth}|${expYear}|${cvv}`
    });
  }
  
  return cards;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['extensionVersion'], (result) => {
    if (result.extensionVersion !== EXTENSION_VERSION) {
      chrome.storage.local.clear(() => {
        chrome.storage.local.set({ 
          extensionVersion: EXTENSION_VERSION,
          defaultbincursorvo1: DEFAULT_BIN
        });
      });
    }
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateCards') {
    generateCardsFromAPI(request.bin, sendResponse, request.method, request.quantity);
    return true;
  }
});

async function generateCardsFromAPI(bin, callback, method = 'api', quantity = DEFAULT_CARD_QUANTITY) {
  try {
    const cleanedBin = cleanBin(bin);
    
    if (cleanedBin.length < 6) {
      callback({ success: false, error: 'BIN must be at least 6 digits' });
      return;
    }
    
    let cards;
    
    if (method === 'luhn') {
      cards = generateCardsWithLuhn(cleanedBin, quantity);
    } else {
      const payload = {
        action: "generateAdvance",
        customBin: cleanedBin,
        format: "pipe",
        quantity: quantity,
        includeDate: true,
        includeCvv: true,
        customCvv: "",
        expirationMonth: "random",
        expirationYear: "random",
        includeMoney: false,
        currency: "USD",
        balance: "500-1000"
      };

      const response = await fetch('https://cardbingenerator.com/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Origin': 'https://cardbingenerator.com',
          'Referer': 'https://cardbingenerator.com/index.php?page=generator'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        callback({ success: false, error: 'API request failed' });
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.cards) {
        callback({ success: false, error: 'No cards generated from API' });
        return;
      }

      cards = data.data.cards.map((card, idx) => ({
        serial_number: idx + 1,
        card_number: card.cardNumber,
        expiry_month: card.expMonth,
        expiry_year: card.expYear,
        cvv: card.cvv,
        full_format: `${card.cardNumber}|${card.expMonth}|${card.expYear}|${card.cvv}`
      }));
    }

    const randomData = generateRandomData();
    
    chrome.storage.local.set({
      generatedCards: cards,
      randomData: randomData,
      generateNextIndex: 0
    });
    
    callback({ success: true, cards: cards });
    
  } catch (error) {
    callback({ success: false, error: error.message });
  }
}

