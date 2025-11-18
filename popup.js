let binInput, cardQuantityInput, generateCardsBtn, autoFillBtn, fillAddressCheckbox, clearBtn, statusDiv, generateMethodSelect;
let cardsInfo, cardsCount, nextIndex;
let advancedFormatTextarea, autoFillNextBtn, advancedFillAddressCheckbox, clearAdvancedBtn, advancedStatusDiv, advancedCardsInfo, advancedCardsCount, advancedNextIndex;
let tabBtns, tabContents;

document.addEventListener('DOMContentLoaded', function() {
  binInput = document.getElementById('bin');
  cardQuantityInput = document.getElementById('cardQuantity');
  generateCardsBtn = document.getElementById('generateCardsBtn');
  autoFillBtn = document.getElementById('autoFillBtn');
  fillAddressCheckbox = document.getElementById('fillAddressCheckbox');
  clearBtn = document.getElementById('clearBtn');
  statusDiv = document.getElementById('status');
  generateMethodSelect = document.getElementById('generateMethod');
  cardsInfo = document.getElementById('cardsInfo');
  cardsCount = document.getElementById('cardsCount');
  nextIndex = document.getElementById('nextIndex');
  
  advancedFormatTextarea = document.getElementById('advancedFormat');
  autoFillNextBtn = document.getElementById('autoFillNextBtn');
  advancedFillAddressCheckbox = document.getElementById('advancedFillAddressCheckbox');
  clearAdvancedBtn = document.getElementById('clearAdvancedBtn');
  advancedStatusDiv = document.getElementById('advancedStatus');
  advancedCardsInfo = document.getElementById('advancedCardsInfo');
  advancedCardsCount = document.getElementById('advancedCardsCount');
  advancedNextIndex = document.getElementById('advancedNextIndex');
  
  const extensionName = document.getElementById('extensionName');
  if (extensionName) {
    extensionName.textContent = EXTENSION_NAME;
  }
  const versionDisplay = document.getElementById('versionDisplay');
  if (versionDisplay) {
    versionDisplay.textContent = `v${EXTENSION_VERSION}`;
  }
  
  tabBtns = document.querySelectorAll('.tab-btn');
  tabContents = document.querySelectorAll('.tab-content');
  
  initializeTabs();
  initializeGenerateTab();
  initializeAdvancedTab();
  loadInitialData();
});

function initializeTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      btn.classList.add('active');
      
      if (tabName === 'generate') {
        document.getElementById('generateTab').classList.add('active');
      } else if (tabName === 'advanced') {
        document.getElementById('advancedTab').classList.add('active');
        loadAdvancedCards();
      }
    });
  });
}

function loadInitialData() {
  chrome.storage.local.get(['defaultbincursorvo1', 'generatedCards', 'generateNextIndex'], function(result) {
    if (result.defaultbincursorvo1) {
      binInput.value = result.defaultbincursorvo1;
    } else {
      binInput.value = DEFAULT_BIN;
    }
    
    if (result.generatedCards && result.generatedCards.length > 0) {
      updateCardsInfo(result.generatedCards.length, result.generateNextIndex || 0);
    }
  });
}

function initializeGenerateTab() {
  chrome.storage.local.get(['generatedCards', 'generateNextIndex'], function(result) {
    if (result.generatedCards && result.generatedCards.length > 0) {
      updateCardsInfo(result.generatedCards.length, result.generateNextIndex || 0);
    }
  });
  
  generateCardsBtn.addEventListener('click', async () => {
    const bin = cleanBin(binInput.value);
    
    if (!bin) {
      updateStatus('Please enter a BIN number', 'error');
      return;
    }
    
    if (bin.length < 6) {
      updateStatus('BIN must be at least 6 digits', 'error');
      return;
    }
    
    const quantity = parseInt(cardQuantityInput.value) || DEFAULT_CARD_QUANTITY;
    if (quantity < 1 || quantity > 100) {
      updateStatus('Quantity must be between 1 and 100', 'error');
      return;
    }
    
    const method = generateMethodSelect.value;
    
    generateCardsBtn.disabled = true;
    updateStatus(method === 'luhn' ? 'Generating cards with Luhn...' : 'Generating cards from API...', 'loading');
    
    chrome.storage.local.set({ 
      defaultbincursorvo1: bin
    });
    
    chrome.runtime.sendMessage({
      action: 'generateCards',
      bin: bin,
      method: method,
      quantity: quantity
    }, (response) => {
      generateCardsBtn.disabled = false;
      
      if (response.success) {
        updateStatus(`✅ Generated ${response.cards.length} cards!`, 'success');
        updateCardsInfo(response.cards.length, 0);
      } else {
        updateStatus('❌ Failed to generate cards. Try again.', 'error');
      }
    });
  });
  
  autoFillBtn.addEventListener('click', () => {
    autoFillNextCard(
      'generatedCards',
      'generateNextIndex',
      'randomData',
      updateStatus,
      updateCardsInfo,
      '❌ No cards loaded. Please generate cards first.',
      '❌ All cards used. Please generate new cards.',
      fillAddressCheckbox.checked
    );
  });
  
  clearBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['defaultbincursorvo1', 'generatedCards', 'generateNextIndex', 'randomData'], function() {
      binInput.value = '';
      cardsInfo.style.display = 'none';
      updateStatus('Cleared saved data', 'success');
    });
  });
}

function updateCardsInfo(total, currentIndex) {
  updateCardsInfoDisplay(cardsCount, nextIndex, cardsInfo, total, currentIndex);
}

function updateAdvancedCardsInfo(total, currentIndex) {
  updateCardsInfoDisplay(advancedCardsCount, advancedNextIndex, advancedCardsInfo, total, currentIndex);
}

function updateStatus(message, type = '') {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
}

function initializeAdvancedTab() {
  chrome.storage.local.get(['advancedCards', 'advancedNextIndex'], function(result) {
    if (result.advancedCards && result.advancedCards.length > 0) {
      updateAdvancedCardsInfo(result.advancedCards.length, result.advancedNextIndex || 0);
    }
  });
  
  advancedFormatTextarea.addEventListener('input', () => {
    setTimeout(() => parseAdvancedFormat(), 10);
  });
  
  autoFillNextBtn.addEventListener('click', () => {
    autoFillNextCard(
      'advancedCards',
      'advancedNextIndex',
      null,
      updateAdvancedStatus,
      updateAdvancedCardsInfo,
      '❌ No cards loaded. Please paste card format first.',
      '❌ All cards used. Please reload format or clear.',
      advancedFillAddressCheckbox.checked
    );
  });
  
  clearAdvancedBtn.addEventListener('click', () => {
    advancedFormatTextarea.value = '';
    chrome.storage.local.remove(['advancedCards', 'advancedNextIndex'], function() {
      updateAdvancedStatus('Cleared format and cards', 'success');
      advancedCardsInfo.style.display = 'none';
    });
  });
}

function parseAdvancedFormat() {
  const formatText = advancedFormatTextarea.value.trim();
  
  if (!formatText) {
    chrome.storage.local.remove(['advancedCards', 'advancedNextIndex'], function() {
      advancedCardsInfo.style.display = 'none';
      updateAdvancedStatus('Format cleared', 'success');
    });
    return;
  }
  
  const lines = formatText.split('\n').filter(line => line.trim());
  const cards = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split('|').map(p => p.trim());
    
    if (parts.length >= 4) {
      const cardNumber = parts[0];
      const expiryMonth = parts[1].padStart(2, '0');
      const expiryYear = parts[2];
      const cvv = parts[3];
      
      cards.push({
        serial_number: i + 1,
        card_number: cardNumber,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv: cvv,
        full_format: `${cardNumber}|${expiryMonth}|${expiryYear}|${cvv}`
      });
    }
  }
  
  if (cards.length > 0) {
    chrome.storage.local.set({
      advancedCards: cards,
      advancedNextIndex: 0
    }, function() {
      updateAdvancedCardsInfo(cards.length, 0);
      updateAdvancedStatus(`✅ Loaded ${cards.length} card(s)`, 'success');
    });
  } else {
    chrome.storage.local.remove(['advancedCards', 'advancedNextIndex'], function() {
      updateAdvancedStatus('⚠️ No valid cards found. Check format.', 'error');
      advancedCardsInfo.style.display = 'none';
    });
  }
}

function loadAdvancedCards() {
  chrome.storage.local.get(['advancedCards', 'advancedNextIndex'], function(result) {
    if (result.advancedCards && result.advancedCards.length > 0) {
      updateAdvancedCardsInfo(result.advancedCards.length, result.advancedNextIndex || 0);
    } else {
      advancedCardsInfo.style.display = 'none';
    }
  });
}


function updateAdvancedStatus(message, type = '') {
  advancedStatusDiv.textContent = message;
  advancedStatusDiv.className = 'status ' + type;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    updateStatus(request.message, request.type);
  }
});
