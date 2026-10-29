import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Radio,
  Send,
  RotateCcw,
  Receipt,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { processTeluguVoiceQuery, speakTeluguText } from '../../services/teluguAssistant';

export const TeluguVoiceAssistant = ({ isOpen, onClose }) => {
  const contextData = useApp();
  const { setActivePage, loadVoiceBillIntoPOS, createSale, notify, settings } = contextData;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechLang, setSpeechLang] = useState('te-IN'); // 'te-IN' | 'en-IN'
  const [transcript, setTranscript] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [editableBill, setEditableBill] = useState(null);
  const [isDirectConfirming, setIsDirectConfirming] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  // Suggested Telugu queries (with AI Advance Mode voice billing prompts)
  const quickChips = [
    { label: '⚡ రమేష్ కి 2 రాయల్ 20L బిల్ రాయి', query: 'రమేష్ శర్మ కి 2 రాయల్ ఎమల్షన్ 20 లీటర్లు బిల్ రాయి' },
    { label: '📝 సురేష్ కి 1 ఏపెక్స్ 20L, 200 డిస్కౌంట్', query: 'సురేష్ కి 1 ఏపెక్స్ అల్టిమా 20L బిల్లు చేయి, డిస్కౌంట్ 200' },
    { label: '🎨 విజయ్ పెయింటర్ 3 ట్రాక్టర్ 20L, ధర 3200', query: 'విజయ్ పెయింటర్ కి 3 డబ్బాలు ట్రాక్టర్ ఎమల్షన్ 20L, ధర 3200 బిల్ రాయి' },
    { label: '📦 రాయల్ ఎమల్షన్ స్టాక్ ఎంత?', query: 'రాయల్ ఎమల్షన్ స్టాక్ ఎంత' },
    { label: '⚠️ ఏ పెయింట్స్ తక్కువగా ఉన్నాయి?', query: 'ఏ పెయింట్స్ తక్కువగా ఉన్నాయి' },
    { label: '💰 ఈరోజు మొత్తం అమ్మకాలు ఎంత?', query: 'ఈరోజు అమ్మకాలు ఎంత' },
    { label: '👥 కస్టమర్ల ఖాతా బకాయి ఎంత?', query: 'కస్టమర్ల బకాయి ఎంత' },
  ];

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. మీరు ప్రశ్నను క్రింద టైప్ చేయవచ్చు.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLang;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      // If finalized
      if (event.results[0].isFinal) {
        handleExecuteQuery(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setErrorMessage('మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో మైక్ ఆన్ చేయండి లేదా క్రింద టైప్ చేయండి.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('ఏ శబ్దం వినబడలేదు. దయచేసి మళ్ళీ మైక్ నొక్కి మాట్లాడండి.');
      } else {
        setErrorMessage(`వాయిస్ ఎర్రర్: ${event.error}. ప్రశ్నను క్రింద టైప్ చేయవచ్చు.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [speechLang]);

  // Handle Query Execution
  const handleExecuteQuery = (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const trimmed = queryText.trim();
    setLastQuery(trimmed);
    setTranscript(trimmed);

    // Stop listening if still active
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Process using the live paint shop knowledge engine
    const answer = processTeluguVoiceQuery(trimmed, contextData);
    setResponse(answer);

    // If this is an AI Advance Mode voice bill preparation
    if (answer?.action?.type === 'PREPARE_VOICE_BILL' && answer.action.bill) {
      setEditableBill(answer.action.bill);
    } else {
      setEditableBill(null);
    }

    // Speak the answer aloud in Telugu
    if (answer?.teluguText) {
      setIsSpeaking(true);
      speakTeluguText(answer.teluguText, () => {
        setIsSpeaking(false);
      });
    }

    // Execute app navigation action if recognized (only for pure navigation)
    if (answer?.action?.type === 'NAVIGATE' && answer.action.page) {
      setTimeout(() => {
        setActivePage(answer.action.page);
      }, 1200);
    }
  };

  // AI Advance Mode: Edit quantity or reduce price for specific customers
  const handleUpdateBillItem = (index, field, value) => {
    if (!editableBill) return;
    const updatedItems = [...editableBill.items];
    const target = { ...updatedItems[index] };

    if (field === 'quantity') {
      target.quantity = Math.max(1, Number(value) || 1);
    } else if (field === 'unitPrice') {
      target.unitPrice = Math.max(0, Number(value) || 0);
    }
    target.total = target.quantity * target.unitPrice;
    updatedItems[index] = target;

    const subtotal = updatedItems.reduce((acc, it) => acc + it.total, 0);
    const netTotal = Math.max(0, subtotal - (Number(editableBill.discount) || 0));

    setEditableBill({
      ...editableBill,
      items: updatedItems,
      subtotal,
      netTotal
    });
  };

  // AI Advance Mode: Edit customer discount to reduce total price
  const handleUpdateDiscount = (val) => {
    if (!editableBill) return;
    const discountNum = Math.max(0, Number(val) || 0);
    const netTotal = Math.max(0, editableBill.subtotal - discountNum);
    setEditableBill({
      ...editableBill,
      discount: discountNum,
      netTotal
    });
  };

  const handleRemoveBillItem = (index) => {
    if (!editableBill || editableBill.items.length <= 1) return;
    const updatedItems = editableBill.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((acc, it) => acc + it.total, 0);
    const netTotal = Math.max(0, subtotal - (Number(editableBill.discount) || 0));
    setEditableBill({
      ...editableBill,
      items: updatedItems,
      subtotal,
      netTotal
    });
  };

  // Load the voice-prepared bill directly into the full POS sales counter
  const handleLoadToPOS = () => {
    if (!editableBill) return;
    loadVoiceBillIntoPOS(editableBill);
    handleStopSpeaking();
    onClose();
  };

  // Instant one-click direct bill confirmation from voice
  const handleDirectConfirm = async () => {
    if (!editableBill || editableBill.items.length === 0) return;
    setIsDirectConfirming(true);
    try {
      const payload = {
        customerId: editableBill.customerId || undefined,
        customerName: editableBill.customerName || 'Walk-in Retail Buyer',
        customerPhone: editableBill.customerPhone || '',
        paymentMode: 'Cash',
        discount: Number(editableBill.discount) || 0,
        notes: '⚡ Created via AI Voice Copilot (Advance Mode)',
        items: editableBill.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        }))
      };
      await createSale(payload);
      handleStopSpeaking();
      speakTeluguText(`${editableBill.customerName} గారి బిల్లు విజయవంతంగా కన్ఫర్మ్ అయింది. స్టాక్ అప్‌డేట్ చేయబడింది.`);
      setEditableBill(null);
      setTimeout(() => {
        onClose();
        setActivePage('sales');
      }, 1400);
    } catch (err) {
      console.error('Direct voice sale confirm error:', err);
      notify(err.message || 'Error creating voice sale', 'warning');
    } finally {
      setIsDirectConfirming(false);
    }
  };

  const handleStartListening = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
      } catch (err) {
        console.error('Recognition start error:', err);
        // If already started, restart
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 150);
      }
    } else {
      setErrorMessage('Speech recognition not available. Please type your query below.');
    }
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleReplayAnswer = () => {
    if (response?.teluguText) {
      setIsSpeaking(true);
      speakTeluguText(response.teluguText, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleExecuteQuery(textInput);
    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay telugu-assistant-overlay">
      <div className="telugu-assistant-card">
        {/* Header */}
        <div className="assistant-header">
          <div className="header-left">
            <div className="assistant-avatar">
              <Sparkles size={20} color="var(--yellow)" />
            </div>
            <div>
              <h3 className="assistant-title">తెలుగు వాయిస్ అసిస్టెంట్</h3>
              <p className="assistant-subtitle">SRI BASKARA PAINTS AGENCIES • Voice AI</p>
            </div>
          </div>

          <div className="header-right">
            {/* Language Selector */}
            <select
              className="assistant-lang-select"
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              title="Speech Recognition Language"
            >
              <option value="te-IN">తెలుగు (Telugu - te-IN)</option>
              <option value="en-IN">English (India - en-IN)</option>
            </select>

            <button
              type="button"
              className="assistant-close-btn"
              onClick={() => {
                handleStopSpeaking();
                if (isListening) {
                  try {
                    recognitionRef.current?.stop();
                  } catch (e) {}
                }
                onClose();
              }}
              title="Close Assistant"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Central Audio / Mic Interaction Zone */}
        <div className="assistant-mic-zone">
          <button
            type="button"
            className={`mic-pulsing-btn ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleStartListening}
            title={isListening ? 'Stop listening' : 'Click to speak in Telugu'}
          >
            {isListening ? (
              <Radio size={36} className="mic-anim-icon" />
            ) : isSpeaking ? (
              <Volume2 size={36} className="mic-anim-icon" />
            ) : (
              <Mic size={36} />
            )}
          </button>

          <div className="mic-status-label">
            {isListening ? (
              <span className="status-listening">
                🔴 వింటున్నాను... దయచేసి మాట్లాడండి (Listening...)
              </span>
            ) : isSpeaking ? (
              <span className="status-speaking">
                🔊 సమాధానం చెబుతున్నాను... (Speaking answer aloud...)
              </span>
            ) : (
              <span className="status-idle">
                మైక్ బటన్ నొక్కి తెలుగులో మాట్లాడండి (Tap mic and speak)
              </span>
            )}
          </div>

          {/* Spoken Query Transcript Preview */}
          {transcript && (
            <div className="transcript-box">
              <span className="transcript-tag">మీరు అడిగింది:</span>
              <p className="transcript-text">"{transcript}"</p>
            </div>
          )}

          {/* Error / Fallback Notification */}
          {errorMessage && (
            <div className="assistant-error-bar">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Answer Display Section */}
        {response && (
          <div className="assistant-answer-box">
            <div className="answer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--orange-500)" />
                <span className="answer-title">ఖచ్చితమైన సమాధానం (Accurate Answer):</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isSpeaking ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleStopSpeaking}
                    title="Stop voice"
                  >
                    <VolumeX size={14} /> ఆపు
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleReplayAnswer}
                    title="Replay Telugu Voice"
                  >
                    <Volume2 size={14} /> మళ్ళీ విను
                  </button>
                )}
              </div>
            </div>

            <div className="answer-content-telugu">
              {response.teluguText}
            </div>

            {response.englishText && (
              <div className="answer-content-english">
                {response.englishText}
              </div>
            )}

            {/* AI Advance Mode: Voice Prepared Bill Card */}
            {editableBill && (
              <div className="voice-bill-card">
                <div className="voice-bill-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="voice-bill-badge">⚡ AI ADVANCE BILL</span>
                    <span className="voice-bill-customer-name">👤 {editableBill.customerName}</span>
                  </div>
                  <span className="voice-bill-hint">ధర తగ్గించే ఆప్షన్ (Edit / reduce prices below)</span>
                </div>

                <div className="voice-bill-table-wrapper">
                  <table className="voice-bill-table">
                    <thead>
                      <tr>
                        <th>ఉత్పత్తి (Product)</th>
                        <th>డబ్బాలు (Qty)</th>
                        <th>ధర (Price)</th>
                        <th style={{ textAlign: 'right' }}>మొత్తం (Total)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableBill.items.map((it, idx) => (
                        <tr key={it.productId || idx}>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{it.productName}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>{it.brand}</span>
                              <span>•</span>
                              <span>{it.packSize}</span>
                              <span>•</span>
                              <span style={{ color: it.currentStock <= 4 ? 'var(--red)' : '#10B981', fontWeight: 700 }}>
                                {it.currentStock <= 4 ? `⚠️ నిల్వ: ${it.currentStock}` : `స్టాక్: ${it.currentStock}`}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="voice-qty-picker">
                              <button
                                type="button"
                                className="voice-qty-btn"
                                onClick={() => handleUpdateBillItem(idx, 'quantity', it.quantity - 1)}
                                disabled={it.quantity <= 1}
                              >
                                -
                              </button>
                              <span style={{ fontWeight: 800, minWidth: '22px', textAlign: 'center' }}>
                                {it.quantity}
                              </span>
                              <button
                                type="button"
                                className="voice-qty-btn"
                                onClick={() => handleUpdateBillItem(idx, 'quantity', it.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)' }}>₹</span>
                                <input
                                  type="number"
                                  className="voice-price-edit-input"
                                  value={it.unitPrice}
                                  onChange={(e) => handleUpdateBillItem(idx, 'unitPrice', e.target.value)}
                                  title="Edit price for this customer (ధర తగ్గించండి)"
                                />
                              </div>
                              {it.originalPrice && it.unitPrice !== it.originalPrice && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--red)', textDecoration: 'line-through' }}>
                                  స్టాక్ ధర: ₹{it.originalPrice}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--ink)' }}>
                            ₹{(it.quantity * it.unitPrice).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {editableBill.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBillItem(idx)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px' }}
                                title="Remove item"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Special Customer Discount & Summary */}
                <div className="voice-bill-footer-bar">
                  <div className="voice-bill-discount-box">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                      కస్టమర్ రాయితీ (Discount ₹):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--muted)' }}>₹</span>
                      <input
                        type="number"
                        className="voice-discount-input"
                        value={editableBill.discount || 0}
                        onChange={(e) => handleUpdateDiscount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="voice-bill-total-summary">
                    <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                      సబ్‌టోటల్: ₹{editableBill.subtotal.toLocaleString('en-IN')}
                      {editableBill.discount > 0 && ` • డిస్కౌంట్: -₹${editableBill.discount}`}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
                      మొత్తం బిల్లు: <span style={{ color: 'var(--red)' }}>₹{editableBill.netTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="voice-bill-action-row">
                  <button
                    type="button"
                    className="btn-voice-pos"
                    onClick={handleLoadToPOS}
                    title="Open this prepared bill in POS sales counter"
                  >
                    <Receipt size={16} />
                    <span>📝 పేపర్ బిల్ కౌంటర్‌కి పంపు (Load in POS Counter)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-voice-confirm"
                    onClick={handleDirectConfirm}
                    disabled={isDirectConfirming}
                    title="Immediately save bill and deduct stock"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isDirectConfirming ? 'సేవ్ అవుతోంది...' : '⚡ ఇప్పుడే బిల్ సేవ్ చేయి (Instant Save)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action button if answer navigated */}
            {!editableBill && response.action?.page && (
              <div className="answer-action-row">
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={() => {
                    setActivePage(response.action.page);
                    onClose();
                  }}
                >
                  <span>{response.action.page.toUpperCase()} పేజీకి వెళ్ళు</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="assistant-chips-section">
          <div className="chips-title">
            <MessageSquare size={14} />
            <span>త్వరిత ప్రశ్నలు (Click any question to ask):</span>
          </div>
          <div className="chips-container">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="query-chip"
                onClick={() => handleExecuteQuery(chip.query)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Fallback Bar */}
        <form className="assistant-input-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="assistant-text-input"
            placeholder="లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి... (e.g. రాయల్ ఎమల్షన్ స్టాక్ ఎంత?)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            type="submit"
            className="assistant-send-btn"
            disabled={!textInput.trim()}
            title="Send query"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
