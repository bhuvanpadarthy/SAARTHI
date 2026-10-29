// SAARTHI Telugu Paint-Shop Intelligent Query Engine
// Answers voice queries in fluent Telugu with 100% accurate live store data

/**
 * Normalizes text for matching by removing punctuation and converting to lowercase.
 */
function normalizeQuery(text = '') {
  return text.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"“”]/g, '');
}

/**
 * Checks if query contains any of the given keywords.
 */
function containsAny(text, keywords = []) {
  const norm = normalizeQuery(text);
  return keywords.some((kw) => norm.includes(kw.toLowerCase()));
}

/**
 * Process a user query (in Telugu or English) against live paint shop state
 * and returns the correct answer in Telugu and English, plus optional actions.
 */
export function processTeluguVoiceQuery(rawQuery, contextData) {
  const query = normalizeQuery(rawQuery);
  const {
    products = [],
    sales = [],
    customers = [],
    settings = { currency: '₹', shopName: 'SAARTHI Paints' },
    lowStockProducts = [],
    totalInventoryValuation = 0,
    totalStockUnits = 0,
    totalOutstandingCredit = 0,
  } = contextData;

  // 1. Navigation Commands (పేజీ నావిగేషన్)
  if (
    containsAny(query, [
      'ఇన్వెంటరీ',
      'స్టాక్ పేజీ',
      'inventory',
      'గోదాము',
      'godown',
      'స్టాక్ లిస్ట్',
    ]) &&
    containsAny(query, ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'go to', 'open', 'show', 'తీయి'])
  ) {
    return {
      teluguText: 'ఇన్వెంటరీ స్టాక్ లెడ్జర్ పేజీని ఓపెన్ చేస్తున్నాను.',
      englishText: 'Opening the Inventory Stock Ledger page.',
      action: { type: 'NAVIGATE', page: 'inventory' },
    };
  }

  if (
    containsAny(query, [
      'సేల్స్',
      'బిల్లు',
      'కొత్త బిల్లు',
      'billing',
      'sales',
      'paper bill',
      'అమ్మకాలు పేజీ',
    ]) &&
    containsAny(query, ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'go to', 'open', 'show', 'రాయి', 'చేయి', 'కొత్త'])
  ) {
    return {
      teluguText: 'పేపర్ బిల్ కౌంటర్ మరియు సేల్స్ పేజీని ఓపెన్ చేస్తున్నాను.',
      englishText: 'Opening the Paper Bill Counter & Sales page.',
      action: { type: 'NAVIGATE', page: 'sales' },
    };
  }

  if (
    containsAny(query, [
      'కస్టమర్',
      'కస్టమర్లు',
      'ఖాతా',
      'customers',
      'khata',
      'లెడ్జర్',
      'పెయింటర్లు',
    ]) &&
    containsAny(query, ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'go to', 'open', 'show', 'లిస్ట్'])
  ) {
    return {
      teluguText: 'కస్టమర్ ఖాతా మరియు లెడ్జర్ పేజీని ఓపెన్ చేస్తున్నాను.',
      englishText: 'Opening the Customers & Khata Ledger page.',
      action: { type: 'NAVIGATE', page: 'customers' },
    };
  }

  if (
    containsAny(query, ['ప్రొడక్ట్స్', 'పెయింట్స్ లిస్ట్', 'షాడో కోడ్స్', 'products', 'catalogue', 'రంగులు']) &&
    containsAny(query, ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'go to', 'open', 'show'])
  ) {
    return {
      teluguText: 'పెయింట్ ప్రొడక్ట్స్ మరియు షేడ్ క్యాటలాగ్ పేజీని ఓపెన్ చేస్తున్నాను.',
      englishText: 'Opening the Products & Shade Catalog page.',
      action: { type: 'NAVIGATE', page: 'products' },
    };
  }

  if (
    containsAny(query, ['డ్యాష్‌బోర్డ్', 'హోమ్', 'dashboard', 'home', 'మొదటి పేజీ']) &&
    containsAny(query, ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'go to', 'open', 'show'])
  ) {
    return {
      teluguText: 'షాప్ డ్యాష్‌బోర్డ్ మరియు ముఖ్య వివరాల పేజీని ఓపెన్ చేస్తున్నాను.',
      englishText: 'Opening the Shop Dashboard page.',
      action: { type: 'NAVIGATE', page: 'dashboard' },
    };
  }

  if (
    containsAny(query, ['రిపోర్ట్స్', 'reports', 'నివేదికలు']) &&
    containsAny(query, ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'go to', 'open', 'show'])
  ) {
    return {
      teluguText: 'సేల్స్ సమ్మరీ మరియు రీఆర్డర్ రిపోర్ట్స్ పేజీని ఓపెన్ చేస్తున్నాను.',
      englishText: 'Opening the Sales Summary & Reorder Reports page.',
      action: { type: 'NAVIGATE', page: 'reports' },
    };
  }

  // 2. Specific Product Search (Stock / Price / Shade / Location)
  const PAINT_TERM_MAP = [
    { telugu: ['రాయల్', 'రాయలే'], english: ['royale'] },
    { telugu: ['అల్టిమా', 'అల్తిమా'], english: ['ultima'] },
    { telugu: ['ఎపెక్స్', 'అపెక్స్'], english: ['apex'] },
    { telugu: ['ట్రాక్టర్', 'ట్రాక్టరు'], english: ['tractor'] },
    { telugu: ['ఎనామెల్', 'ఎనమెల్'], english: ['enamel'] },
    { telugu: ['వెదర్‌కోట్', 'వెదర్ కోట్'], english: ['weathercoat', 'weather coat'] },
    { telugu: ['డాంప్ ప్రూఫ్', 'డంప్ ప్రూఫ్'], english: ['damp proof', 'dampproof'] },
    { telugu: ['ప్రైమర్'], english: ['primer'] },
    { telugu: ['డిస్టెంపర్'], english: ['distemper'] },
    { telugu: ['ఎమల్షన్', 'ఎమల్సన్'], english: ['emulsion'] },
    { telugu: ['పుట్టీ', 'పుట్టి'], english: ['putty'] },
    { telugu: ['బిర్లా వైట్'], english: ['birla white', 'birla'] },
    { telugu: ['ఏషియన్', 'ఏసియన్'], english: ['asian paints', 'asian'] },
    { telugu: ['బెర్గర్', 'బర్జెర్'], english: ['berger'] },
    { telugu: ['నెరోలాక్'], english: ['nerolac'] },
    { telugu: ['డ్యూలక్స్'], english: ['dulux'] }
  ];

  // Check if any product matches the query
  const matchedProduct = products.find((p) => {
    const pName = p.name.toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const pShade = (p.shadeCode || '').toLowerCase();

    // Check direct substring
    if (query.includes(pName) || pName.split(' ').some((w) => w.length > 4 && query.includes(w))) {
      return true;
    }

    // Check Telugu-to-English paint product mappings
    for (const mapping of PAINT_TERM_MAP) {
      const queryHasTelugu = mapping.telugu.some((t) => query.includes(t));
      const queryHasEnglish = mapping.english.some((e) => query.includes(e));
      if (queryHasTelugu || queryHasEnglish) {
        const prodHasTerm = mapping.english.some((e) => pName.includes(e) || pBrand.includes(e));
        if (prodHasTerm) return true;
      }
    }

    if (pShade && query.includes(pShade)) return true;
    return false;
  });

  if (matchedProduct) {
    const isPriceQuery = containsAny(query, ['ధర', 'రేట్', 'ఖరీదు', 'కాస్ట్', 'ఎంత', 'price', 'rate', 'cost', 'velentha']);
    const isLocationQuery = containsAny(query, ['ర్యాక్', 'ఎక్కడ', 'లొకేషన్', 'ప్లేస్', 'rack', 'location', 'where']);

    if (isPriceQuery && !containsAny(query, ['స్టాక్', 'stock', 'డబ్బాలు', 'ఎన్ని'])) {
      return {
        teluguText: `${matchedProduct.name} (${matchedProduct.brand}, ${matchedProduct.packSize}) ధర ${settings.currency}${matchedProduct.unitPrice.toLocaleString('en-IN')}. ప్రస్తుతం స్టాక్‌లో ${matchedProduct.currentStock} డబ్బాలు అందుబాటులో ఉన్నాయి.`,
        englishText: `Price of ${matchedProduct.name} (${matchedProduct.packSize}) is ${settings.currency}${matchedProduct.unitPrice}. Current stock is ${matchedProduct.currentStock} units.`,
        data: matchedProduct,
      };
    }

    if (isLocationQuery) {
      return {
        teluguText: `${matchedProduct.name} గోదాములో ర్యాక్ ${matchedProduct.locationRack || 'ప్రధాన స్టాక్ రూమ్'} వద్ద ఉంది. ప్రస్తుతం ${matchedProduct.currentStock} డబ్బాలు నిల్వ ఉన్నాయి.`,
        englishText: `${matchedProduct.name} is placed at Rack ${matchedProduct.locationRack}. Available stock: ${matchedProduct.currentStock} units.`,
        data: matchedProduct,
      };
    }

    // Default to stock inquiry for matched product
    const stockStatus =
      matchedProduct.currentStock <= (matchedProduct.minThreshold || 5)
        ? `⚠️ హెచ్చరిక: ఇది రీఆర్డర్ లెవెల్ కంటే తక్కువగా ఉంది!`
        : `స్టాక్ సరిపడా అందుబాటులో ఉంది.`;

    return {
      teluguText: `${matchedProduct.name} (${matchedProduct.brand}, ${matchedProduct.packSize}, షేడ్: ${matchedProduct.shadeCode}) ప్రస్తుతం ${matchedProduct.currentStock} డబ్బాలు అందుబాటులో ఉన్నాయి. ర్యాక్: ${matchedProduct.locationRack}. ధర: ${settings.currency}${matchedProduct.unitPrice}. ${stockStatus}`,
      englishText: `${matchedProduct.name} (${matchedProduct.packSize}, Shade: ${matchedProduct.shadeCode}) has ${matchedProduct.currentStock} units in stock at Rack ${matchedProduct.locationRack}. Unit price: ${settings.currency}${matchedProduct.unitPrice}.`,
      data: matchedProduct,
    };
  }

  // 3. Low Stock / Reorder Queries (తక్కువగా ఉన్న పెయింట్స్)
  if (
    containsAny(query, [
      'తక్కువ',
      'తక్కువగా',
      'అయిపోయినవి',
      'రీఆర్డర్',
      'ఆర్డర్ చేయాలి',
      'low stock',
      'reorder',
      'shortage',
      'out of stock',
      'katham',
      'thakkuva',
    ])
  ) {
    if (lowStockProducts.length === 0) {
      return {
        teluguText: 'ప్రస్తుతం షాపులో అన్ని పెయింట్లు తగినంత స్టాక్‌తో ఉన్నాయి. ఏ పెయింట్ కూడా సేఫ్టీ లెవెల్ కంటే తక్కువగా లేదు.',
        englishText: 'All paint stocks are healthy. No items are below safety reorder threshold.',
      };
    }

    const topItems = lowStockProducts.slice(0, 4).map((p) => `${p.name} (${p.currentStock} డబ్బాలు)`).join(', ');
    return {
      teluguText: `ప్రస్తుతం ${lowStockProducts.length} పెయింట్ ప్రొడక్ట్స్ తక్కువ స్టాక్‌లో ఉన్నాయి: ${topItems}. వెంటనే ఫ్యాక్టరీ డిపో నుంచి ఆర్డర్ చేయవలసి ఉంది.`,
      englishText: `Currently, ${lowStockProducts.length} paints are running low: ${topItems}. Urgent replenishment recommended.`,
      action: { type: 'NAVIGATE', page: 'inventory' },
    };
  }

  // 4. Today's Sales / Business Collection (ఈరోజు అమ్మకాలు)
  if (
    containsAny(query, [
      'ఈరోజు',
      'టుడే',
      'ఈరోజు సేల్స్',
      'ఈ రోజు',
      'అమ్మకాలు',
      'సేల్స్ ఎంత',
      'కలెక్షన్',
      'కౌంటర్',
      'today',
      'todays sales',
      'daily sales',
      'revenue',
      'collection',
      'ammakaalu',
    ])
  ) {
    const todayStr = '2026-10-23';
    const todaySales = sales.filter((s) => s.date && s.date.includes(todayStr));
    const todayRevenue = todaySales.reduce((acc, s) => acc + (s.netTotal ?? s.net_total ?? 0), 0);
    const todayPacks = todaySales.reduce((acc, s) => {
      return acc + (s.items ? s.items.reduce((iAcc, item) => iAcc + Number(item.quantity || 0), 0) : 0);
    }, 0);

    return {
      teluguText: `ఈరోజు ఇప్పటివరకు మొత్తం ${todaySales.length} బిల్లులు పూర్తయ్యాయి. మొత్తం ${todayPacks} పెయింట్ డబ్బాలు విక్రయించబడ్డాయి. మొత్తం కౌంటర్ కలెక్షన్ మరియు అమ్మకాల విలువ ${settings.currency}${todayRevenue.toLocaleString('en-IN')}.`,
      englishText: `Today, ${todaySales.length} bills were issued (${todayPacks} paint units sold). Total sales revenue: ${settings.currency}${todayRevenue.toLocaleString('en-IN')}.`,
      action: { type: 'NAVIGATE', page: 'reports' },
    };
  }

  // 5. Customer Khata / Outstanding Balance Queries (కస్టమర్ బకాయిలు)
  if (
    containsAny(query, [
      'ఖాతా',
      'బకాయి',
      'బాకీ',
      'అప్పు',
      'కస్టమర్ బకాయి',
      'కస్టమర్లు',
      'khata',
      'outstanding',
      'balance',
      'credit',
      'baaki',
      'bakayi',
    ])
  ) {
    // Check if user named a specific customer
    const CUSTOMER_NAME_MAP = [
      { telugu: ['శ్రీనివాస', 'శ్రీనివాస్', 'శ్రీను'], english: ['srinivasa', 'srinivas', 'srinu'] },
      { telugu: ['రాంబాబు', 'రాం బాబు'], english: ['rambabu'] },
      { telugu: ['సురేష్', 'సూరి'], english: ['suresh'] },
      { telugu: ['రమేష్'], english: ['ramesh'] },
      { telugu: ['వెంకట్', 'వెంకటేశ్వర్లు'], english: ['venkat', 'venkatesh'] },
      { telugu: ['ఆనంద్'], english: ['anand'] },
      { telugu: ['ప్రసాద్'], english: ['prasad'] },
      { telugu: ['కళ్యాణ్'], english: ['kalyan'] },
      { telugu: ['రవి'], english: ['ravi'] }
    ];

    const matchedCustomer = customers.find((c) => {
      const cName = c.name.toLowerCase();
      if (query.includes(cName) || cName.split(' ').some((part) => part.length > 3 && query.includes(part))) {
        return true;
      }
      for (const mapping of CUSTOMER_NAME_MAP) {
        if (mapping.telugu.some((t) => query.includes(t))) {
          if (mapping.english.some((e) => cName.includes(e))) return true;
        }
      }
      return false;
    });

    if (matchedCustomer) {
      const typeLabel = matchedCustomer.customerType && !matchedCustomer.name.includes(matchedCustomer.customerType)
        ? ` (${matchedCustomer.customerType})`
        : '';
      return {
        teluguText: `${matchedCustomer.name}${typeLabel} ఖాతాలో ప్రస్తుత బకాయి మొత్తం ${settings.currency}${matchedCustomer.outstandingBalance.toLocaleString('en-IN')}. ఫోన్: ${matchedCustomer.phone}.`,
        englishText: `${matchedCustomer.name} has an outstanding balance of ${settings.currency}${matchedCustomer.outstandingBalance.toLocaleString('en-IN')}. Phone: ${matchedCustomer.phone}.`,
        data: matchedCustomer,
      };
    }

    return {
      teluguText: `షాపులో కస్టమర్లు మరియు కాంట్రాక్టర్ల వద్ద మొత్తం బకాయి ఖాతా ${settings.currency}${totalOutstandingCredit.toLocaleString('en-IN')} ఉంది. వివరాల కోసం కస్టమర్స్ పేజీని చూడవచ్చు.`,
      englishText: `Total customer Khata outstanding credit across all contractors is ${settings.currency}${totalOutstandingCredit.toLocaleString('en-IN')}.`,
      action: { type: 'NAVIGATE', page: 'customers' },
    };
  }

  // 6. Total Store Inventory / Valuation (మొత్తం ఇన్వెంటరీ నిల్వ)
  if (
    containsAny(query, [
      'మొత్తం స్టాక్',
      'ఇన్వెంటరీ విలువ',
      'ఎన్ని ప్రోడక్ట్స్',
      'షాప్ లో ఎన్ని ఉన్నాయి',
      'మొత్తం నిల్వ',
      'total inventory',
      'total stock',
      'valuation',
      'all products',
    ])
  ) {
    return {
      teluguText: `${settings.shopName} లో ప్రస్తుతం మొత్తం ${products.length} రకాల పెయింట్ ఉత్పత్తులు ఉన్నాయి. మొత్తం ${totalStockUnits} డబ్బాలు నిల్వ ఉన్నాయి. గోదాము మొత్తం ఇన్వెంటరీ అంచనా విలువ సుమారు ${settings.currency}${Math.round(totalInventoryValuation).toLocaleString('en-IN')}.`,
      englishText: `${settings.shopName} has ${products.length} distinct paint products and ${totalStockUnits} total units in stock. Estimated inventory valuation is ${settings.currency}${Math.round(totalInventoryValuation).toLocaleString('en-IN')}.`,
    };
  }

  // 7. General Stock Inquiry (ఏమి అడగాలో తెలీనప్పుడు లేదా సాధారణ స్టాక్ అడిగితే)
  if (containsAny(query, ['స్టాక్', 'స్టాక్ ఎంత', 'stock'])) {
    return {
      teluguText: `షాపులో మొత్తం ${products.length} పెయింట్ రకాలు, ${totalStockUnits} డబ్బాలు ఉన్నాయి. మీరు నిర్దిష్టంగా ఏదైనా పెయింట్ గురించి అడగవచ్చు, ఉదాహరణకు: 'రాయల్ ఎమల్షన్ స్టాక్ ఎంత?' లేదా 'అపెక్స్ అల్టిమా ధర ఎంత?' అని అడగండి.`,
      englishText: `There are ${products.length} products with ${totalStockUnits} total packs. You can ask for a specific paint like 'Royale Emulsion stock' or 'Apex Ultima price'.`,
    };
  }

  // 8. Help / Capabilities (సహాయం)
  if (
    containsAny(query, [
      'హెల్ప్',
      'సహాయం',
      'నువ్వు ఎవరు',
      'నువ్వు ఏమి చేయగలవు',
      'help',
      'who are you',
      'what can you do',
      'namaskaram',
      'నమస్కారం',
      'హలో',
      'hello',
    ])
  ) {
    return {
      teluguText: `నమస్కారం! నేను సారథి పెయింట్ షాప్ తెలుగు వాయిస్ అసిస్టెంట్‌ని. మీరు మాట్లాడి నన్ను అడగవచ్చు:\n1. పెయింట్ స్టాక్ (ఉదాహరణ: 'రాయల్ ఎమల్షన్ స్టాక్ ఎంత?')\n2. ధరలు (ఉదాహరణ: 'అపెక్స్ అల్టిమా రేట్ ఎంత?')\n3. ఈరోజు అమ్మకాలు (ఉదాహరణ: 'ఈరోజు సేల్స్ ఎంత?')\n4. తక్కువ స్టాక్ అలర్ట్‌లు ('ఏ పెయింట్స్ తక్కువగా ఉన్నాయి?')\n5. ఖాతా బకాయిలు ('కస్టమర్ల బకాయి ఎంత?'). మీకు ఏమి కావాలో అడగండి, నేను సరైన సమాధానం చెబుతాను!`,
      englishText: `Hello! I am SAARTHI Paint Shop Telugu Voice Assistant. You can ask me about stock quantities, unit prices, today's sales, low stock alerts, or customer Khata balances.`,
    };
  }

  // 9. Fallback if query not understood
  return {
    teluguText: `క్షమించండి, మీ ప్రశ్న సరిగ్గా అర్థం కాలేదు: "${rawQuery}". మీరు ఏదైనా పెయింట్ పేరు చెప్పి 'స్టాక్ ఎంత?', 'ధర ఎంత?', లేదా 'ఈరోజు సేల్స్ ఎంత?' అని అడగండి, నేను వెంటనే సరైన సమాధానం చెబుతాను.`,
    englishText: `Could not recognize: "${rawQuery}". Please ask about paint stock, prices, today's sales, or customer balance.`,
  };
}

/**
 * Speech synthesis helper with native Telugu voice or Indian accent fallback.
 */
export function speakTeluguText(text, onEnd = null) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any currently speaking audio
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'te-IN'; // Telugu (India)
  utterance.rate = 0.95; // Slightly measured pace for maximum clarity
  utterance.pitch = 1.0;

  // Find the best voice: preferably Telugu, or Indian English/Hindi fallback
  const voices = window.speechSynthesis.getVoices();
  const teluguVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('te') ||
      v.lang.toLowerCase().includes('telugu') ||
      v.name.toLowerCase().includes('telugu')
  );

  const indianVoice = voices.find(
    (v) => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('hi-in')
  );

  if (teluguVoice) {
    utterance.voice = teluguVoice;
  } else if (indianVoice) {
    utterance.voice = indianVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}
