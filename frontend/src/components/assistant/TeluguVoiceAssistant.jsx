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
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { processTeluguVoiceQuery, speakTeluguText } from '../../services/teluguAssistant';

export const TeluguVoiceAssistant = ({ isOpen, onClose }) => {
  const contextData = useApp();
  const { setActivePage } = contextData;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechLang, setSpeechLang] = useState('te-IN'); // 'te-IN' | 'en-IN'
  const [transcript, setTranscript] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  // Suggested Telugu queries
  const quickChips = [
    { label: '📦 రాయల్ ఎమల్షన్ స్టాక్ ఎంత?', query: 'రాయల్ ఎమల్షన్ స్టాక్ ఎంత' },
    { label: '⚠️ ఏ పెయింట్స్ తక్కువగా ఉన్నాయి?', query: 'ఏ పెయింట్స్ తక్కువగా ఉన్నాయి' },
    { label: '💰 ఈరోజు మొత్తం అమ్మకాలు ఎంత?', query: 'ఈరోజు అమ్మకాలు ఎంత' },
    { label: '👥 కస్టమర్ల ఖాతా బకాయి ఎంత?', query: 'కస్టమర్ల బకాయి ఎంత' },
    { label: '🎨 అపెక్స్ అల్టిమా రేట్ ఎంత?', query: 'అపెక్స్ అల్టిమా రేట్ ఎంత' },
    { label: '📑 కొత్త పేపర్ బిల్ రాయి', query: 'కొత్త బిల్లు ఓపెన్ చేయి' },
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

    // Speak the answer aloud in Telugu
    if (answer?.teluguText) {
      setIsSpeaking(true);
      speakTeluguText(answer.teluguText, () => {
        setIsSpeaking(false);
      });
    }

    // Execute app navigation action if recognized
    if (answer?.action?.type === 'NAVIGATE' && answer.action.page) {
      setTimeout(() => {
        setActivePage(answer.action.page);
      }, 1200);
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

            {/* Action button if answer navigated */}
            {response.action?.page && (
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
