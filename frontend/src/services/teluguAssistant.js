// SAARTHI Telugu Paint-Shop Intelligent Voice Copilot & Conversational Billing Engine
// SRI BASKARA PAINTS AGENCIES
// Answers voice queries in fluent Telugu with 100% accurate live store data
// Supports multi-turn spoken billing commands, pack size disambiguation, stock safety, and decimal-safe calculations.

/**
 * Normalizes text for matching by removing punctuation and converting to lowercase.
 */
function normalizeQuery(text = '') {
  return text.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_~()?'"“”]/g, '');
}

/**
 * Checks if query contains any of the given keywords.
 */
function containsAny(text, keywords = []) {
  const norm = normalizeQuery(text);
  return keywords.some((kw) => norm.includes(kw.toLowerCase()));
}

const NUMBER_MAP = {
  'ఒకటి': 1, 'ఒక': 1, 'వన్': 1, 'one': 1, '1': 1,
  'రెండు': 2, 'రెండూ': 2, 'టూ': 2, 'two': 2, '2': 2,
  'మూడు': 3, 'త్రీ': 3, 'three': 3, '3': 3,
  'నాలుగు': 4, 'ఫోర్': 4, 'four': 4, '4': 4,
  'ఐదు': 5, 'ఫైవ్': 5, 'five': 5, '5': 5,
  'ఆరు': 6, 'సిక్స్': 6, 'six': 6, '6': 6,
  'ఏడు': 7, 'సెవెన్': 7, 'seven': 7, '7': 7,
  'ఎనిమిది': 8, 'ఎయిట్': 8, 'eight': 8, '8': 8,
  'తొమ్మిది': 9, 'నైన్': 9, 'nine': 9, '9': 9,
  'పది': 10, 'టెన్': 10, 'ten': 10, '10': 10,
  'ఇరవై': 20, 'ట్వంటీ': 20, 'twenty': 20, '20': 20
};

// Global active voice billing session state
export let activeVoiceBillingSession = {
  active: false,
  customerId: null,
  customerName: 'Walk-in Retail Buyer',
  customerPhone: '',
  items: [],
  discount: 0,
  subtotal: 0,
  netTotal: 0,
  status: 'draft',
  confirmedSale: null, // Stores confirmed invoice for zero-deduction reprinting!
};

export function getActiveVoiceSession() {
  return activeVoiceBillingSession;
}

export function resetActiveVoiceSession() {
  activeVoiceBillingSession = {
    active: false,
    customerId: null,
    customerName: 'Walk-in Retail Buyer',
    customerPhone: '',
    items: [],
    discount: 0,
    subtotal: 0,
    netTotal: 0,
    status: 'draft',
    confirmedSale: null,
  };
  return activeVoiceBillingSession;
}

export function updateActiveVoiceSession(updates) {
  activeVoiceBillingSession = {
    ...activeVoiceBillingSession,
    ...updates,
  };
  return activeVoiceBillingSession;
}

/**
 * Multi-turn Voice Billing Command Handler
 */
export function handleConversationalBilling(rawQuery, contextData = {}) {
  const query = rawQuery.toLowerCase().trim();
  const { products = [], customers = [], settings = { currency: '₹', shopName: 'SRI BASKARA PAINTS AGENCIES' } } = contextData;

  // 1. REPRINT BILL COMMAND: "ఈ బిల్లును మళ్లీ ప్రింట్ చేయి"
  if (
    containsAny(query, ['మళ్లీ ప్రింట్', 'మళ్ళీ ప్రింట్', 'మరలా ప్రింట్', 'reprint', 'print again', 'duplicate bill'])
  ) {
    if (!activeVoiceBillingSession.confirmedSale) {
      return {
        teluguText: 'ప్రస్తుతం రీప్రింట్ చేయడానికి మునుపటి రసీదు ఏదీ లేదు. దయచేసి సేల్స్ పేజీలో పాత బిల్లును ఎంచుకోండి.',
        englishText: 'No recent confirmed invoice found to reprint. Please select a past invoice from the sales list.',
        action: { type: 'NAVIGATE', page: 'sales' },
      };
    }

    return {
      teluguText: `ఖరారైన బిల్లు నంబర్ ${activeVoiceBillingSession.confirmedSale.billNumber || activeVoiceBillingSession.confirmedSale.bill_number} ను మళ్లీ ప్రింట్ చేస్తున్నాను. స్టాక్ మళ్లీ తగ్గించబడదు.`,
      englishText: `Reprinting confirmed invoice #${activeVoiceBillingSession.confirmedSale.billNumber}. Stock will not be deducted again.`,
      action: {
        type: 'REPRINT_INVOICE',
        sale: activeVoiceBillingSession.confirmedSale,
      },
    };
  }

  // 2. PRINT BILL COMMAND: "ఈ బిల్లును తెలుగులో ప్రింట్ చేయి" / "ప్రింట్ చేయి"
  if (
    containsAny(query, ['ప్రింట్ చేయి', 'తెలుగులో ప్రింట్', 'ప్రింట్ తీయి', 'రసీదు ప్రింట్', 'print bill', 'print invoice'])
  ) {
    const saleToPrint = activeVoiceBillingSession.confirmedSale || (activeVoiceBillingSession.items.length > 0 ? {
      ...activeVoiceBillingSession,
      billNumber: 'DRAFT-PREVIEW',
      isDraft: true,
    } : null);

    if (!saleToPrint) {
      return {
        teluguText: 'ప్రింట్ చేయడానికి ప్రస్తుతం ఎటువంటి బిల్లు సిద్ధంగా లేదు. దయచేసి ముందుగా బిల్లును తయారు చేయండి.',
        englishText: 'No bill available to print. Please create a bill first.',
      };
    }

    return {
      teluguText: 'బిల్లు ప్రింట్ విండోను ఓపెన్ చేస్తున్నాను. ప్రింటర్ డైలాగ్‌లో ప్రింట్ బటన్ నొక్కండి.',
      englishText: 'Opening print dialog for the invoice.',
      action: {
        type: 'PRINT_BILL',
        sale: saleToPrint,
      },
    };
  }

  // 3. INQUIRE BILL TOTAL: "బిల్లు మొత్తం ఎంత?" / "ఎంత అయింది"
  if (
    containsAny(query, ['బిల్లు మొత్తం ఎంత', 'మొత్తం ఎంత', 'టోటల్ ఎంత', 'ఎంత అయింది', 'bill total', 'how much total', 'grand total'])
  ) {
    if (!activeVoiceBillingSession.active || activeVoiceBillingSession.items.length === 0) {
      return {
        teluguText: 'ప్రస్తుతం డ్రాఫ్ట్ బిల్లులో ఎటువంటి వస్తువులు లేవు. దయచేసి పెయింట్ డబ్బాలు వేయండి.',
        englishText: 'The current draft bill is empty.',
      };
    }

    const totalPacks = activeVoiceBillingSession.items.reduce((s, it) => s + it.quantity, 0);
    return {
      teluguText: `${activeVoiceBillingSession.customerName} గారి ప్రస్తుత బిల్లులో ${activeVoiceBillingSession.items.length} రకాల పెయింట్స్ (మొత్తం ${totalPacks} డబ్బాలు) ఉన్నాయి. మొత్తం నికర బిల్లు ${settings.currency}${activeVoiceBillingSession.netTotal.toLocaleString('en-IN')}.`,
      englishText: `Current bill for ${activeVoiceBillingSession.customerName} has ${totalPacks} units. Grand total: ${settings.currency}${activeVoiceBillingSession.netTotal.toLocaleString('en-IN')}.`,
      action: { type: 'SHOW_BILL_SUMMARY', bill: activeVoiceBillingSession },
    };
  }

  // 4. READ BILL ALOUD (PRE-FINALIZATION SUMMARY): "బిల్లు చదువు" / "సారాంశం చెప్పు"
  if (
    containsAny(query, ['బిల్లు చదువు', 'బిల్ చదువు', 'సారాంశం', 'వివరాలు చెప్పు', 'read bill', 'summarize bill'])
  ) {
    if (!activeVoiceBillingSession.active || activeVoiceBillingSession.items.length === 0) {
      return {
        teluguText: 'ప్రస్తుతం డ్రాఫ్ట్‌లో ఎటువంటి వస్తువులు లేవు.',
        englishText: 'No items in current draft bill.',
      };
    }

    const itemsReadout = activeVoiceBillingSession.items
      .map((it) => `${it.quantity} డబ్బా ${it.productName} (${it.packSize}) ${settings.currency}${(it.quantity * it.unitPrice).toLocaleString('en-IN')}`)
      .join(', ');

    return {
      teluguText: `${activeVoiceBillingSession.customerName} గారి బిల్లులో: ${itemsReadout} ఉన్నాయి. డిస్కౌంట్: ${settings.currency}${activeVoiceBillingSession.discount}. మొత్తం ${settings.currency}${activeVoiceBillingSession.netTotal.toLocaleString('en-IN')}. బిల్లును ఖరారు చేయమంటారా?`,
      englishText: `Bill for ${activeVoiceBillingSession.customerName}: ${itemsReadout}. Net total ${settings.currency}${activeVoiceBillingSession.netTotal.toLocaleString('en-IN')}. Confirm sale?`,
      action: { type: 'READ_BILL_SUMMARY', bill: activeVoiceBillingSession },
    };
  }

  // 5. REDUCE QUANTITY OR REMOVE ITEM: "ఈ బిల్లులో ఒక డబ్బా తగ్గించు" / "రాయల్ తీసేయి"
  if (
    containsAny(query, ['తగ్గించు', 'తీసేయి', 'తీసివేయి', 'మైనస్', 'ఒక డబ్బా తగ్గించు', 'reduce', 'remove', 'minus'])
  ) {
    if (!activeVoiceBillingSession.active || activeVoiceBillingSession.items.length === 0) {
      return {
        teluguText: 'ప్రస్తుత బిల్లులో తగ్గించడానికి ఎటువంటి ఐటెమ్స్ లేవు.',
        englishText: 'No items to reduce in the draft bill.',
      };
    }

    const updatedItems = [...activeVoiceBillingSession.items];
    const lastItemIdx = updatedItems.length - 1;
    const lastItem = updatedItems[lastItemIdx];

    if (lastItem.quantity > 1) {
      lastItem.quantity -= 1;
      lastItem.total = lastItem.quantity * lastItem.unitPrice;
      updatedItems[lastItemIdx] = lastItem;
    } else {
      updatedItems.pop();
    }

    const subtotal = updatedItems.reduce((acc, it) => acc + it.total, 0);
    const netTotal = Math.max(0, subtotal - (activeVoiceBillingSession.discount || 0));

    activeVoiceBillingSession.items = updatedItems;
    activeVoiceBillingSession.subtotal = subtotal;
    activeVoiceBillingSession.netTotal = netTotal;

    return {
      teluguText: `బిల్లులో ఒక డబ్బా తగ్గించాను. ప్రస్తుతం మొత్తం ${updatedItems.length} ఐటెమ్స్ ఉన్నాయి. కొత్త మొత్తం విలువ ${settings.currency}${netTotal.toLocaleString('en-IN')}.`,
      englishText: `Reduced one can from the bill. New total is ${settings.currency}${netTotal.toLocaleString('en-IN')}.`,
      action: { type: 'UPDATE_VOICE_BILL', bill: activeVoiceBillingSession },
    };
  }

  // 6. CONFIRM SALE: "బిల్లును ఖరారు చేయి" / "కన్ఫర్మ్ చేయి" / "సేవ్ చేయి"
  if (
    containsAny(query, ['ఖరారు చేయి', 'కన్ఫర్మ్ చేయి', 'బిల్లు సేవ్ చేయి', 'ఫైనల్ చేయి', 'confirm sale', 'confirm bill', 'save bill'])
  ) {
    if (!activeVoiceBillingSession.active || activeVoiceBillingSession.items.length === 0) {
      return {
        teluguText: 'ఖరారు చేయడానికి బిల్లులో ఎటువంటి వస్తువులు లేవు. దయచేసి ముందుగా పెయింట్ డబ్బాలు వేయండి.',
        englishText: 'Cannot confirm empty bill.',
      };
    }

    return {
      teluguText: `${activeVoiceBillingSession.customerName} గారి బిల్లును సర్వర్‌లో ఖరారు చేస్తున్నాను. స్టాక్ అప్‌డేట్ అవుతోంది...`,
      englishText: `Confirming sale for ${activeVoiceBillingSession.customerName} on the server...`,
      action: {
        type: 'CONFIRM_SALE',
        bill: activeVoiceBillingSession,
      },
    };
  }

  // 7. START NEW DRAFT BILL FOR CUSTOMER: "సారథి, భువన్ పేరు మీద కొత్త బిల్లు తయారు చేయి"
  const isStartDraftIntent = containsAny(query, [
    'కొత్త బిల్లు', 'కొత్త బిల్', 'బిల్లు తయారు చేయి', 'బిల్ తయారు చేయి', 'పేరు మీద', 'పేరుతో', 'గారికి బిల్', 'కి బిల్',
    'new bill', 'create bill', 'start bill', 'prepare bill for'
  ]);

  if (isStartDraftIntent) {
    // Identify customer from speech
    let identifiedCust = null;
    for (const c of customers) {
      const cLower = c.name.toLowerCase();
      if (query.includes(cLower) || cLower.split(' ').some(part => part.length > 3 && query.includes(part))) {
        identifiedCust = c;
        break;
      }
    }

    // Common customer aliases
    const ALIASES = [
      { names: ['భువన్', 'భువన్ పడర్తి'], english: 'Bhuvan', phone: '+91 99887-66554' },
      { names: ['రమేష్', 'రమేష్ శర్మ'], english: 'Ramesh Sharma (Contractor)', phone: '+91 98765-11223' },
      { names: ['విజయ్', 'విజయ్ పెయింటర్'], english: 'Vijay Painter (Master Karigar)', phone: '+91 98112-33445' },
      { names: ['సురేష్'], english: 'Suresh Kumar', phone: '+91 98450-12345' },
      { names: ['రాంబాబు'], english: 'Rambabu Painter', phone: '+91 98480-22334' },
    ];

    if (!identifiedCust) {
      for (const al of ALIASES) {
        if (al.names.some(n => query.includes(n)) || query.includes(al.english.toLowerCase())) {
          const matchFromStore = customers.find(c => c.name.toLowerCase().includes(al.english.toLowerCase().split(' ')[0]));
          identifiedCust = matchFromStore || {
            id: '',
            name: al.english,
            phone: al.phone,
            customerType: 'Retail Buyer',
          };
          break;
        }
      }
    }

    let customerName = identifiedCust ? identifiedCust.name : 'Walk-in Retail Buyer';
    let customerId = identifiedCust ? identifiedCust.id : '';
    let customerPhone = identifiedCust ? identifiedCust.phone : '';

    if (!identifiedCust) {
      const nameMatch = query.match(/(?:పేరు మీద|పేరుతో|గారికి|కి|for)\s+([a-zA-Z\u0C00-\u0C7F]+)/i);
      if (nameMatch && nameMatch[1] && !['కొత్త', 'బిల్లు', 'రాయల్', 'పెయింట్', 'డబ్బా'].includes(nameMatch[1])) {
        customerName = nameMatch[1].trim();
        customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
      }
    }

    // Reset and initialize session
    activeVoiceBillingSession = {
      active: true,
      customerId,
      customerName,
      customerPhone,
      items: [],
      discount: 0,
      subtotal: 0,
      netTotal: 0,
      status: 'draft',
      confirmedSale: null,
    };

    return {
      teluguText: `సరేనండి, ${customerName} గారి పేరు మీద కొత్త బిల్లు ప్రారంభించాను. ఏ పెయింట్ వేయమంటారో చెప్పండి (ఉదాహరణకు: 'ఆసియన్ పెయింట్స్ రాయల్ 1 లీటర్ 2 డబ్బాలు వేయి').`,
      englishText: `Started draft bill for ${customerName}. What paints would you like to add?`,
      action: {
        type: 'INIT_VOICE_DRAFT',
        bill: activeVoiceBillingSession,
        page: 'sales',
      },
    };
  }

  // 8. ADD PRODUCT TO DRAFT BILL: "ఆసియన్ పెయింట్స్ రాయల్ ఒక లీటర్ రెండు డబ్బాలు వేయి" / "వైట్ ప్రైమర్ ఒక డబ్బా కూడా వేయి"
  const isAddProductIntent = containsAny(query, [
    'వేయి', 'చేర్చు', 'రాయి', 'యాడ్', 'డబ్బా', 'డబ్బాలు', 'లీటర్', 'లీటర్లు', 'కూడా వేయి', 'add', 'put', 'enter'
  ]);

  if (isAddProductIntent || activeVoiceBillingSession.active) {
    // A. Detect Pack Size
    let requestedPackSize = null;
    if (query.includes('20 l') || query.includes('20l') || query.includes('20 లీటర్లు') || query.includes('20 లీటర్') || query.includes('20లీ')) {
      requestedPackSize = '20 L';
    } else if (query.includes('10 l') || query.includes('10l') || query.includes('10 లీటర్లు') || query.includes('10 లీటర్') || query.includes('10లీ')) {
      requestedPackSize = '10 L';
    } else if (query.includes('4 l') || query.includes('4l') || query.includes('4 లీటర్లు') || query.includes('4 లీటర్') || query.includes('4లీ')) {
      requestedPackSize = '4 L';
    } else if (query.includes('1 l') || query.includes('1l') || query.includes('1 లీటరు') || query.includes('1 లీటర్') || query.includes('1లీ') || query.includes('ఒక లీటర్') || query.includes('ఒక లీటరు')) {
      requestedPackSize = '1 L';
    } else if (query.includes('15 kg') || query.includes('15kg') || query.includes('15 కేజీ')) {
      requestedPackSize = '15 Kg';
    }

    // B. Detect Quantity
    let qty = 1;
    const qtyMatch = query.match(/(\d+|ఒకటి|ఒక|రెండు|మూడు|నాలుగు|ఐదు|ఆరు|ఏడు|ఎనిమిది|తొమ్మిది|పది|one|two|three|four|five|ten)\s*(?:డబ్బాలు|డబ్బా|బకెట్|బకెట్లు|లీటర్లు|cans|tins|packs)/i);
    if (qtyMatch && qtyMatch[1]) {
      const rawWord = qtyMatch[1].toLowerCase().trim();
      qty = NUMBER_MAP[rawWord] || Number(rawWord) || 1;
    } else {
      const numMatch = query.match(/\b([1-9]|10|20)\b/);
      if (numMatch && numMatch[1]) {
        qty = Number(numMatch[1]);
      }
    }

    // C. Detect Product in Catalogue
    const PRODUCT_KEYWORDS = [
      { key: 'royale', terms: ['royale', 'రాయల్', 'రాయలే'] },
      { key: 'primer', terms: ['primer', 'ప్రైమర్', 'వైట్ ప్రైమర్', 'trucare primer', 'వాల్ ప్రైమర్'] },
      { key: 'apex', terms: ['apex', 'ultima', 'అపెక్స్', 'అల్టిమా', 'ఎపెక్స్'] },
      { key: 'weathercoat', terms: ['weathercoat', 'weather coat', 'వెదర్‌కోట్'] },
      { key: 'dampshield', terms: ['dampshield', 'dampproof', 'డాంప్ షీల్డ్', 'వాటర్‌ప్రూఫ్', 'dr fixit', 'డాక్టర్ ఫిక్సిట్'] },
      { key: 'tractor', terms: ['tractor', 'ట్రాక్టర్', 'ట్రాక్టరు'] },
      { key: 'enamel', terms: ['enamel', 'ఎనామెల్', 'apcolite', 'ఆప్కోలైట్'] },
      { key: 'silk', terms: ['silk', 'సిల్క్', 'గ్లామర్'] },
    ];

    let matchedKeyword = null;
    for (const pk of PRODUCT_KEYWORDS) {
      if (pk.terms.some(t => query.includes(t))) {
        matchedKeyword = pk;
        break;
      }
    }

    if (matchedKeyword) {
      // Find candidate products matching keyword
      const candidates = products.filter(p => {
        const nameLower = p.name.toLowerCase();
        return matchedKeyword.terms.some(t => nameLower.includes(t));
      });

      if (candidates.length === 0) {
        return {
          teluguText: 'క్షమించండి, ఆ పెయింట్ మన క్యాటలాగ్‌లో లేదు. దయచేసి వేరే పెయింట్ పేరు చెప్పండి.',
          englishText: 'Product not found in the shop catalogue.',
        };
      }

      // Check for variant pack size disambiguation (Section 4 Requirement)
      if (!requestedPackSize && candidates.length > 1) {
        const availablePacks = [...new Set(candidates.map(p => p.packSize))].join(', ');
        return {
          teluguText: `${candidates[0].name} లో ${availablePacks} సైజులు అందుబాటులో ఉన్నాయి. మీకు ఏ సైజు డబ్బా వేయమంటారు?`,
          englishText: `Multiple pack sizes available (${availablePacks}). Which pack size would you like to add?`,
          action: { type: 'DISAMBIGUATE_PACK_SIZE', candidates },
        };
      }

      // Match product with specific pack size
      let matchedProduct = null;
      if (requestedPackSize) {
        matchedProduct = candidates.find(p => p.packSize.toLowerCase().replace(/\s/g, '') === requestedPackSize.toLowerCase().replace(/\s/g, ''));
      }
      if (!matchedProduct) {
        matchedProduct = candidates[0];
      }

      // Stock Insufficiency Check (Section 4 Requirement)
      if (matchedProduct.currentStock < qty) {
        return {
          teluguText: `క్షమించండి, ${matchedProduct.name} (${matchedProduct.packSize}) ప్రస్తుత నిల్వ ${matchedProduct.currentStock} డబ్బాలు మాత్రమే ఉన్నాయి. మీరు ఎన్ని డబ్బాలు వేయమంటారు?`,
          englishText: `Insufficient stock. Only ${matchedProduct.currentStock} units available for ${matchedProduct.name} (${matchedProduct.packSize}).`,
          action: { type: 'STOCK_SHORTAGE_ALERT', product: matchedProduct, available: matchedProduct.currentStock },
        };
      }

      // Add to session items
      const existingIdx = activeVoiceBillingSession.items.findIndex(it => it.productId === matchedProduct.id);
      if (existingIdx !== -1) {
        activeVoiceBillingSession.items[existingIdx].quantity += qty;
        activeVoiceBillingSession.items[existingIdx].total = activeVoiceBillingSession.items[existingIdx].quantity * activeVoiceBillingSession.items[existingIdx].unitPrice;
      } else {
        activeVoiceBillingSession.items.push({
          productId: matchedProduct.id,
          productName: matchedProduct.name,
          brand: matchedProduct.brand,
          packSize: matchedProduct.packSize,
          shadeCode: matchedProduct.shadeCode || '',
          quantity: qty,
          unitPrice: matchedProduct.unitPrice,
          originalPrice: matchedProduct.unitPrice,
          currentStock: matchedProduct.currentStock,
          total: qty * matchedProduct.unitPrice,
        });
      }

      activeVoiceBillingSession.subtotal = activeVoiceBillingSession.items.reduce((s, it) => s + it.total, 0);
      activeVoiceBillingSession.netTotal = Math.max(0, activeVoiceBillingSession.subtotal - (activeVoiceBillingSession.discount || 0));

      const totalItemsCount = activeVoiceBillingSession.items.reduce((s, it) => s + it.quantity, 0);
      return {
        teluguText: `${matchedProduct.name} (${matchedProduct.packSize}) ${qty} డబ్బా${qty > 1 ? 'లు' : ''} బిల్లులో చేర్చాను. ప్రస్తుతం మొత్తం ${totalItemsCount} డబ్బాలు ఉన్నాయి (మొత్తం ${settings.currency}${activeVoiceBillingSession.netTotal.toLocaleString('en-IN')}). ఇంకా ఏమైనా వేయమంటారా?`,
        englishText: `Added ${qty} units of ${matchedProduct.name} (${matchedProduct.packSize}) to the bill. Grand total: ${settings.currency}${activeVoiceBillingSession.netTotal.toLocaleString('en-IN')}.`,
        action: {
          type: 'UPDATE_VOICE_BILL',
          bill: activeVoiceBillingSession,
          product: matchedProduct,
        },
      };
    }
  }

  return null;
}

/**
 * Process a user query against live paint shop state
 * and returns the correct answer in Telugu and English, plus optional actions.
 */
export function processTeluguVoiceQuery(rawQuery, contextData) {
  const query = normalizeQuery(rawQuery);
  const {
    products = [],
    sales = [],
    customers = [],
    settings = { currency: '₹', shopName: 'SRI BASKARA PAINTS AGENCIES' },
    lowStockProducts = [],
    totalInventoryValuation = 0,
    totalStockUnits = 0,
    totalOutstandingCredit = 0,
  } = contextData;

  // 0. Conversational Multi-turn Billing Engine
  const billingResult = handleConversationalBilling(rawQuery, contextData);
  if (billingResult) {
    return billingResult;
  }

  // 1. Specific Product Stock & Price Queries
  const matchedProduct = products.find((p) => {
    const pName = p.name.toLowerCase();
    if (query.includes(pName) || pName.split(' ').some((word) => word.length > 4 && query.includes(word))) {
      return true;
    }
    if (query.includes('రాయల్') && (pName.includes('royale') || pName.includes('luxury'))) return true;
    if (query.includes('అపెక్స్') || query.includes('ఎపెక్స్') || query.includes('అల్టిమా')) {
      if (pName.includes('apex') || pName.includes('ultima')) return true;
    }
    if (query.includes('ప్రైమర్') && pName.includes('primer')) return true;
    if (query.includes('వెదర్') && pName.includes('weathercoat')) return true;
    if (query.includes('డాంప్') && pName.includes('damp')) return true;
    return false;
  });

  if (matchedProduct) {
    if (containsAny(query, ['ధర', 'రేట్', 'ఎంత', 'cost', 'price', 'rate'])) {
      return {
        teluguText: `${matchedProduct.name} (${matchedProduct.brand}, ${matchedProduct.packSize}) ధర ${settings.currency}${matchedProduct.unitPrice}. స్టాక్: ${matchedProduct.currentStock} డబ్బాలు అందుబాటులో ఉన్నాయి.`,
        englishText: `${matchedProduct.name} (${matchedProduct.packSize}) sells for ${settings.currency}${matchedProduct.unitPrice}. Available stock: ${matchedProduct.currentStock} units.`,
        data: matchedProduct,
      };
    }

    return {
      teluguText: `${matchedProduct.name} (${matchedProduct.brand}, ${matchedProduct.packSize}) ప్రస్తుతం ${matchedProduct.currentStock} డబ్బాలు అందుబాటులో ఉన్నాయి. ధర: ${settings.currency}${matchedProduct.unitPrice}.`,
      englishText: `${matchedProduct.name} has ${matchedProduct.currentStock} units in stock at ${settings.currency}${matchedProduct.unitPrice}.`,
      data: matchedProduct,
    };
  }

  // 2. Low Stock & Reorder Queries
  if (containsAny(query, ['తక్కువ', 'తక్కువగా', 'అయిపోయినవి', 'రీఆర్డర్', 'low stock', 'reorder', 'shortage'])) {
    if (lowStockProducts.length === 0) {
      return {
        teluguText: 'ప్రస్తుతం షాపులో అన్ని పెయింట్లు తగినంత స్టాక్‌తో ఉన్నాయి. ఏ పెయింట్ కూడా సేఫ్టీ లెవెల్ కంటే తక్కువగా లేదు.',
        englishText: 'All paint stocks are healthy. No items are below safety threshold.',
      };
    }

    const topItems = lowStockProducts.slice(0, 4).map((p) => `${p.name} (${p.currentStock} డబ్బాలు)`).join(', ');
    return {
      teluguText: `ప్రస్తుతం ${lowStockProducts.length} పెయింట్ ప్రొడక్ట్స్ తక్కువ స్టాక్‌లో ఉన్నాయి: ${topItems}. వెంటనే డిపో నుంచి ఆర్డర్ చేయవలసి ఉంది.`,
      englishText: `Currently, ${lowStockProducts.length} paints are running low: ${topItems}.`,
      action: { type: 'NAVIGATE', page: 'inventory' },
    };
  }

  // 3. Today's Sales
  if (containsAny(query, ['ఈరోజు', 'టుడే', 'సేల్స్', 'అమ్మకాలు', 'కలెక్షన్', 'today', 'sales'])) {
    const todayRevenue = sales.reduce((acc, s) => acc + (s.netTotal ?? s.net_total ?? 0), 0);
    return {
      teluguText: `ఈరోజు మొత్తం కౌంటర్ అమ్మకాల విలువ సుమారు ${settings.currency}${todayRevenue.toLocaleString('en-IN')}.`,
      englishText: `Today's sales total is ${settings.currency}${todayRevenue.toLocaleString('en-IN')}.`,
      action: { type: 'NAVIGATE', page: 'reports' },
    };
  }

  // 4. Customer Khata / Balance
  if (containsAny(query, ['ఖాతా', 'బకాయి', 'బాకీ', 'అప్పు', 'khata', 'balance', 'credit'])) {
    return {
      teluguText: `షాపులో కస్టమర్లు మరియు కాంట్రాక్టర్ల వద్ద మొత్తం బకాయి ఖాతా ${settings.currency}${totalOutstandingCredit.toLocaleString('en-IN')} ఉంది.`,
      englishText: `Total Khata credit outstanding is ${settings.currency}${totalOutstandingCredit.toLocaleString('en-IN')}.`,
      action: { type: 'NAVIGATE', page: 'customers' },
    };
  }

  // 5. Fallback Help
  return {
    teluguText: `నమస్కారం! నేను శ్రీ భాస్కర పెయింట్స్ AI అసిస్టెంట్‌ని. మీరు "సారథి, భువన్ పేరు మీద కొత్త బిల్లు రాయి", "ఆసియన్ పెయింట్స్ రాయల్ 1 లీటర్ 2 డబ్బాలు వేయి", "రాయల్ ఎమల్షన్ స్టాక్ ఎంత?", లేదా "ఈరోజు అమ్మకాలు ఎంత?" అని అడగవచ్చు.`,
    englishText: 'Hello! I am your AI Paint Shop Voice Assistant. Ask about stock, prepare paper bills, or check daily sales.',
  };
}

/**
 * Text-to-Speech synthesizer in Telugu or Indian English
 */
export function speakTeluguText(text, onComplete) {
  if (!('speechSynthesis' in window)) {
    if (onComplete) onComplete();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const teluguVoice = voices.find((v) => v.lang === 'te-IN' || v.lang === 'te');
  const indianVoice = voices.find((v) => v.lang === 'en-IN');

  if (teluguVoice) {
    utterance.voice = teluguVoice;
    utterance.lang = 'te-IN';
  } else if (indianVoice) {
    utterance.voice = indianVoice;
    utterance.lang = 'en-IN';
  } else {
    utterance.lang = 'te-IN';
  }

  utterance.onend = () => {
    if (onComplete) onComplete();
  };

  utterance.onerror = (e) => {
    console.warn('TTS playback error:', e);
    if (onComplete) onComplete();
  };

  window.speechSynthesis.speak(utterance);
}
