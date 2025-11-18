function cleanBin(bin) {
  return bin.replace(/x/gi, '').replace(/\s+/g, '').trim();
}

function updateCardsInfoDisplay(countElement, indexElement, infoElement, total, currentIndex) {
  countElement.textContent = total;
  indexElement.textContent = currentIndex + 1;
  infoElement.style.display = 'block';
}

async function autoFillNextCard(cardsKey, indexKey, randomDataKey, updateStatusFn, updateInfoFn, noCardsMsg, allUsedMsg, fillAddress = true) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url || !tab.url.includes('checkout.stripe.com')) {
    updateStatusFn('❌ Please open a Stripe checkout page first!', 'error');
    return;
  }
  
  const storageKeys = [cardsKey, indexKey];
  if (randomDataKey) {
    storageKeys.push(randomDataKey);
  }
  
  chrome.storage.local.get(storageKeys, async function(result) {
    const cards = result[cardsKey];
    if (!cards || cards.length === 0) {
      updateStatusFn(noCardsMsg, 'error');
      return;
    }
    
    const currentIndex = result[indexKey] || 0;
    
    if (currentIndex >= cards.length) {
      updateStatusFn(allUsedMsg, 'error');
      return;
    }
    
    const selectedCard = cards[currentIndex];
    const randomData = randomDataKey && result[randomDataKey] ? result[randomDataKey] : generateRandomData();
    
    const newIndex = currentIndex + 1;
    const updateData = {};
    updateData[indexKey] = newIndex;
    chrome.storage.local.set(updateData);
    updateInfoFn(cards.length, newIndex);
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillFormWithCard',
      card: selectedCard,
      randomData: randomData,
      fillAddress: fillAddress
    }, (response) => {
      if (chrome.runtime.lastError) {
        updateStatusFn('❌ Error: Please refresh the Stripe page', 'error');
        return;
      }
      
      updateStatusFn(`✅ Filled card ${currentIndex + 1} of ${cards.length} - Auto-filling...`, 'success');
    });
  });
}

