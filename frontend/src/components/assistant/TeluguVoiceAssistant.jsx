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
  Tag,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  processTeluguVoiceQuery,
  speakTeluguText,
  getActiveVoiceSession,
  resetActiveVoiceSession,
  updateActiveVoiceSession
} from '../../services/teluguAssistant';

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

  // Spoken billing query chips corresponding to the exact user workflow
  const quickChips = [
    { label: '⚡ భువన్ పేరు మీద కొత్త బిల్లు చేయి', query: 'సారథి, భువన్ పేరు మీద కొత్త బిల్లు తయారు చేయి' },
    { label: '🎨 రాయల్ 1L 2 డబ్బాలు వేయి', query: 'ఆసియన్ పెయింట్స్ రాయల్ ఒక లీటర్ రెండు డబ్బాలు వేయి' },
    { label: '🖌️ వైట్ ప్రైమర్ 1 డబ్బా వేయి', query: 'వైట్ ప్రైమర్ ఒక డబ్బా కూడా వేయి' },
    { label: '➖ 1 డబ్బా తగ్గించు', query: 'ఈ బిల్లులో ఒక డబ్బా తగ్గించు' },
    { label: '💰 బిల్లు మొత్తం ఎంత?', query: 'బిల్లు మొత్తం ఎంత' },
    { label: '🖨️ తెలుగులో ప్రింట్ చేయి', query: 'ఈ బిల్లును తెలుగులో ప్రింట్ చేయి' },
    { label: '🔄 మళ్లీ ప్రింట్ చేయి', query: 'ఈ బిల్లును మళ్లీ ప్రింట్ చేయి' },
    { label: '📦 రాయల్ స్టాక్ ఎంత?', query: 'రాయల్ ఎమల్షన్ స్టాక్ ఎంత' },
    { label: '⚠️ తక్కువగా ఉన్న పెయింట్స్', query: 'ఏ పెయింట్స్ తక్కువగా ఉన్నాయి' },
    { label: '👥 కస్టమర్ల బకాయి ఎంత?', query: 'కస్టమర్ల బకాయి ఎంత' },
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

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Process query using conversational engine
    const answer = processTeluguVoiceQuery(trimmed, contextData);
    setResponse(answer);

    // If conversational draft bill modified or initialized
    if (answer?.action?.bill) {
      setEditableBill({ ...answer.action.bill });
    }

    // Speak answer in Telugu
    if (answer?.teluguText) {
      setIsSpeaking(true);
      speakTeluguText(answer.teluguText, () => {
        setIsSpeaking(false);
      });
    }

    // Handle Confirm Sale command
    if (answer?.action?.type === 'CONFIRM_SALE') {
      setTimeout(() => {
        handleDirectConfirm();
      }, 1000);
    }

    // Handle Print or Reprint Bill command
    if (answer?.action?.type === 'PRINT_BILL' || answer?.action?.type === 'REPRINT_INVOICE') {
      setTimeout(() => {
        if (answer.action.sale) {
          loadVoiceBillIntoPOS(answer.action.sale);
        }
        window.print();
      }, 1200);
    }

    // Pure navigation
    if (answer?.action?.type === 'NAVIGATE' && answer.action.page) {
      setTimeout(() => {
        setActivePage(answer.action.page);
      }, 1200);
    }
  };

  // Price & Quantity Editing (Price reduction for special customers)
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

    const updated = {
      ...editableBill,
      items: updatedItems,
      subtotal,
      netTotal
    };

    setEditableBill(updated);
    updateActiveVoiceSession(updated);
  };

  // Special Customer Discount
  const handleUpdateDiscount = (val) => {
    if (!editableBill) return;
    const discountNum = Math.max(0, Number(val) || 0);
    const netTotal = Math.max(0, editableBill.subtotal - discountNum);
    const updated = {
      ...editableBill,
      discount: discountNum,
      netTotal
    };
    setEditableBill(updated);
    updateActiveVoiceSession(updated);
  };

  const handleRemoveBillItem = (index) => {
    if (!editableBill || editableBill.items.length <= 1) return;
    const updatedItems = editableBill.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((acc, it) => acc + it.total, 0);
    const netTotal = Math.max(0, subtotal - (Number(editableBill.discount) || 0));
    const updated = {
      ...editableBill,
      items: updatedItems,
      subtotal,
      netTotal
    };
    setEditableBill(updated);
    updateActiveVoiceSession(updated);
  };

  // Load bill into POS counter
  const handleLoadToPOS = () => {
    if (!editableBill) return;
    loadVoiceBillIntoPOS(editableBill);
    handleStopSpeaking();
    onClose();
  };

  // Direct safe confirmation via server API
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
        notes: '⚡ Spoken Voice Sale (Sri Baskara Voice Copilot)',
        items: editableBill.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        }))
      };

      const confirmed = await createSale(payload);
      handleStopSpeaking();

      // Store in session for zero-stock-deduction reprinting!
      updateActiveVoiceSession({
        status: 'confirmed',
        confirmedSale: confirmed
      });

      speakTeluguText(`${editableBill.customerName} గారి బిల్లు ఖరారైంది. స్టాక్ అప్‌డేట్ చేయబడింది.`);
      setEditableBill(null);

      setTimeout(() => {
        onClose();
        setActivePage('sales');
      }, 1500);
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
        {/* Header (Obsidian & Metallic Gold Luxury) */}
        <div className="assistant-header">
          <div className="header-left">
            <div className="assistant-avatar">
              <Sparkles size={22} color="#141414" />
            </div>
            <div>
              <h3 className="assistant-title">సారథి తెలుగు వాయిస్ అసిస్టెంట్</h3>
              <p className="assistant-subtitle">SRI BASKARA PAINTS AGENCIES • ADVANCE VOICE COPILOT</p>
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
              <X size={18} />
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
              <Radio size={38} className="mic-anim-icon" />
            ) : isSpeaking ? (
              <Volume2 size={38} className="mic-anim-icon" />
            ) : (
              <Mic size={38} />
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

          {/* Error Notification */}
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
                <Sparkles size={16} color="var(--gold-primary)" />
                <span className="answer-title">ఖచ్చితమైన సమాధానం (Accurate Answer):</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isSpeaking ? (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#262626', color: '#EAEAEA', border: '1px solid rgba(212,175,55,0.3)', padding: '5px 10px', borderRadius: '6px' }}
                    onClick={handleStopSpeaking}
                    title="Stop voice"
                  >
                    <VolumeX size={14} /> ఆపు
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#262626', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '5px 10px', borderRadius: '6px' }}
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

            {/* AI Advance Mode: Spoken Prepared Bill Card with Price Editor */}
            {editableBill && editableBill.items && editableBill.items.length > 0 && (
              <div className="voice-bill-card" style={{ background: '#181818', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #996515 100%)', color: '#141414', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                      ⚡ AI VOICE BILL
                    </span>
                    <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.95rem' }}>
                      👤 {editableBill.customerName}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600 }}>
                    ధర తగ్గించే ఆప్షన్ (Edit / reduce prices below)
                  </span>
                </div>

                <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#D4AF37', textAlign: 'left' }}>
                        <th style={{ padding: '8px 6px' }}>ఉత్పత్తి (Product)</th>
                        <th style={{ padding: '8px 6px' }}>డబ్బాలు (Qty)</th>
                        <th style={{ padding: '8px 6px' }}>ధర (Price ₹)</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right' }}>మొత్తం (Total)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableBill.items.map((it, idx) => (
                        <tr key={it.productId || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <td style={{ padding: '10px 6px' }}>
                            <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{it.productName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#B5AFA4', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>{it.brand}</span>
                              <span>•</span>
                              <span>{it.packSize}</span>
                              <span>•</span>
                              <span style={{ color: it.currentStock <= 4 ? '#F87171' : '#34D399', fontWeight: 700 }}>
                                {it.currentStock <= 4 ? `⚠️ నిల్వ: ${it.currentStock}` : `స్టాక్: ${it.currentStock}`}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 6px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#252525', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                              <button
                                type="button"
                                style={{ padding: '4px 8px', color: '#FFFFFF', cursor: 'pointer' }}
                                onClick={() => handleUpdateBillItem(idx, 'quantity', it.quantity - 1)}
                                disabled={it.quantity <= 1}
                              >
                                -
                              </button>
                              <span style={{ fontWeight: 800, minWidth: '22px', textAlign: 'center', color: '#FFFFFF' }}>
                                {it.quantity}
                              </span>
                              <button
                                type="button"
                                style={{ padding: '4px 8px', color: '#FFFFFF', cursor: 'pointer' }}
                                onClick={() => handleUpdateBillItem(idx, 'quantity', it.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '10px 6px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37' }}>₹</span>
                                <input
                                  type="number"
                                  style={{
                                    width: '80px',
                                    background: '#222222',
                                    border: '1px solid rgba(212, 175, 55, 0.35)',
                                    borderRadius: '6px',
                                    padding: '4px 6px',
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    fontSize: '0.82rem'
                                  }}
                                  value={it.unitPrice}
                                  onChange={(e) => handleUpdateBillItem(idx, 'unitPrice', e.target.value)}
                                  title="Edit price for this customer (ధర తగ్గించండి)"
                                />
                              </div>
                              {it.originalPrice && it.unitPrice !== it.originalPrice && (
                                <span style={{ fontSize: '0.68rem', color: '#F87171', textDecoration: 'line-through' }}>
                                  స్టాక్ ధర: ₹{it.originalPrice}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 800, color: '#FFFFFF' }}>
                            ₹{(it.quantity * it.unitPrice).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 4px' }}>
                            {editableBill.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBillItem(idx)}
                                style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', padding: '4px' }}
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Special Customer Discount & Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202020', padding: '12px 16px', borderRadius: '10px', flexWrap: 'wrap', gap: '10px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: '#B5AFA4', letterSpacing: '0.05em' }}>
                      కస్టమర్ రాయితీ (Discount):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#D4AF37' }}>₹</span>
                      <input
                        type="number"
                        style={{
                          width: '75px',
                          background: '#141414',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}
                        value={editableBill.discount || 0}
                        onChange={(e) => handleUpdateDiscount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#B5AFA4' }}>
                      సబ్‌టోటల్: ₹{editableBill.subtotal.toLocaleString('en-IN')}
                      {editableBill.discount > 0 && ` • డిస్కౌంట్: -₹${editableBill.discount}`}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                      మొత్తం బిల్లు: <span style={{ color: '#D4AF37' }}>₹{editableBill.netTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: '#252525',
                      color: '#FFFFFF',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                    onClick={handleLoadToPOS}
                    title="Open this prepared bill in POS sales counter"
                  >
                    <Receipt size={16} />
                    <span>📝 పేపర్ బిల్ కౌంటర్‌కి పంపు</span>
                  </button>

                  <button
                    type="button"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                    }}
                    onClick={handleDirectConfirm}
                    disabled={isDirectConfirming}
                    title="Immediately save bill and deduct stock"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isDirectConfirming ? 'సేవ్ అవుతోంది...' : '⚡ ఇప్పుడే బిల్ ఖరారు చేయి (Confirm Sale)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="assistant-chips-section">
          <div className="chips-title">
            <MessageSquare size={14} />
            <span>త్వరిత ప్రశ్నలు (Click any question to speak/ask):</span>
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
            placeholder="లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి... (e.g. సారథి, భువన్ పేరు మీద కొత్త బిల్లు రాయి)"
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
