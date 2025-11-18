let isProcessing = false;

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for ${selector}`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fillFormFields(card, randomData, fillAddress = true) {
  showNotification('🔄 Auto-filling card details...', 'info');
  
  await sleep(1000);
  
  const cardButton = document.querySelector('[data-testid="card-accordion-item-button"]');
  if (cardButton) {
    cardButton.click();
    await sleep(1000);
  }
  
  const cardNumberInput = await waitForElement('input[placeholder*="1234"]');
  if (cardNumberInput) {
    cardNumberInput.focus();
    cardNumberInput.value = card.card_number;
    cardNumberInput.dispatchEvent(new Event('input', { bubbles: true }));
    cardNumberInput.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(300);
  }
  
  const expiryInput = document.querySelector('input[placeholder*="MM"]');
  if (expiryInput) {
    const expiryStr = `${card.expiry_month}${card.expiry_year.slice(-2)}`;
    expiryInput.focus();
    expiryInput.value = expiryStr;
    expiryInput.dispatchEvent(new Event('input', { bubbles: true }));
    expiryInput.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(300);
  }
  
  const cvcInputs = document.querySelectorAll('input[placeholder="CVC"], input[name*="cvc"], input[name*="cvv"]');
  if (cvcInputs.length > 0) {
    const cvcInput = cvcInputs[0];
    cvcInput.focus();
    cvcInput.value = card.cvv;
    cvcInput.dispatchEvent(new Event('input', { bubbles: true }));
    cvcInput.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(300);
  }
  
  const nameInput = document.querySelector('input[placeholder*="Full name"], input[placeholder*="name on card"]');
  if (nameInput) {
    nameInput.focus();
    nameInput.value = randomData.name;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(300);
  }
  
  const countrySelect = document.querySelector('select');
  if (countrySelect) {
    countrySelect.value = DEFAULT_COUNTRY;
    countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(500);
  }
  
  await sleep(500);
  
  if (fillAddress) {
    const allTextInputs = document.querySelectorAll('input[type="text"]');
    for (const input of allTextInputs) {
      const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      const name = (input.getAttribute('name') || '').toLowerCase();
      
      if (placeholder.includes('address') && !placeholder.includes('line 2') && !placeholder.includes('email')) {
        console.log('✅ Filling address field');
        input.focus();
        input.value = randomData.address;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(300);
      } else if (placeholder.includes('line 2') || name.includes('line2')) {
        console.log('⚠️ Skipping address line 2');
      } else if (placeholder.includes('city')) {
        console.log('✅ Filling city field');
        input.focus();
        input.value = randomData.city;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(300);
      } else if (placeholder.includes('zip') || placeholder.includes('postal')) {
        console.log('✅ Filling ZIP field');
        input.focus();
        input.value = randomData.zip;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(300);
      }
    }
    
    const stateField = document.querySelector('input[placeholder*="state" i], select[name*="state" i], input[autocomplete="address-level1"]');
    if (stateField) {
      console.log('✅ Filling state field');
      stateField.focus();
      stateField.value = randomData.state;
      stateField.dispatchEvent(new Event('input', { bubbles: true }));
      stateField.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(300);
    }
  }
}

async function fillCardForm() {
  if (isProcessing) {
    return;
  }
  
  isProcessing = true;
  
  try {
    const storage = await chrome.storage.local.get(['generatedCards', 'randomData']);
    
    if (!storage.generatedCards || storage.generatedCards.length === 0) {
      showNotification('⚠️ Please generate cards first from extension popup', 'warning');
      isProcessing = false;
      return;
    }
    
    const card = storage.generatedCards[Math.floor(Math.random() * storage.generatedCards.length)];
    const randomData = storage.randomData;
    
    await fillFormFields(card, randomData);
    showNotification('✅ All details filled successfully!', 'success');
    
  } catch (error) {
    showNotification('❌ Error: ' + error.message, 'error');
  }
  
  isProcessing = false;
}

async function fillCardFormWithCard(card, randomData, fillAddress = true) {
  if (isProcessing) {
    return;
  }
  
  isProcessing = true;
  
  try {
    await fillFormFields(card, randomData, fillAddress);
    showNotification('✅ Card details filled successfully!', 'success');
    
  } catch (error) {
    showNotification('❌ Error: ' + error.message, 'error');
  }
  
  isProcessing = false;
}

function showNotification(message, type = 'info') {
  const existing = document.getElementById('auto-card-filler-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'auto-card-filler-notification';
  notification.textContent = message;
  
  const colors = {
    info: '#3498db',
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: colors[type] || colors.info,
    color: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: '999999',
    fontSize: '14px',
    fontWeight: '600',
    maxWidth: '300px',
    animation: 'slideIn 0.3s ease-out'
  });
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'all 0.3s ease-out';
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillCardForm();
    sendResponse({ success: true });
  } else if (request.action === 'fillFormWithCard') {
    fillCardFormWithCard(request.card, request.randomData, request.fillAddress !== false);
    sendResponse({ success: true });
  }
  return true;
});

