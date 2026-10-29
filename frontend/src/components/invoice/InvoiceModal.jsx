import React, { useState } from 'react';
import { Printer, X, Languages, AlertCircle, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { InvoiceA4 } from './InvoiceA4';

export const InvoiceModal = ({
  isOpen,
  onClose,
  sale,
  isDraft = false,
}) => {
  const [language, setLanguage] = useState('bilingual'); // 'bilingual' | 'english' | 'telugu'
  const [printDispatched, setPrintDispatched] = useState(false);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    try {
      setPrintDispatched(true);
      // Small timeout allows any pending layout paint before triggering dialog
      setTimeout(() => {
        window.print();
      }, 50);
    } catch (err) {
      console.error('Print trigger error:', err);
      alert('Unable to open browser print dialog. Please use Ctrl+P or check browser print permissions.');
    }
  };

  return (
    <div className="modal-overlay a4-modal-overlay">
      <div className="a4-modal-container">
        {/* Modal Top Action Bar (Hidden on print) */}
        <div className="a4-modal-toolbar no-print">
          <div className="toolbar-left">
            <div className="toolbar-title">
              <Printer size={18} color="var(--orange-500)" />
              <span>A4 Tax Invoice & Print Preview</span>
              {isDraft ? (
                <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                  Draft Preview (No Stock Deducted)
                </span>
              ) : (
                <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                  <ShieldCheck size={12} /> Finalized Bill
                </span>
              )}
            </div>
          </div>

          <div className="toolbar-right">
            {/* Language Selector */}
            <div className="lang-switcher">
              <Languages size={15} color="var(--slate-500)" />
              <select
                className="form-select form-select-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
              >
                <option value="bilingual">Bilingual (English + తెలుగు)</option>
                <option value="english">English Only</option>
                <option value="telugu">తెలుగు మాత్రమే (Telugu)</option>
              </select>
            </div>

            {/* Print Button */}
            <button
              type="button"
              className="btn btn-accent"
              onClick={handlePrint}
              title="Open browser print dialog to print on A4 or save as PDF"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={onClose}
              title="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Informative Status Banner (Hidden on print) */}
        <div className="a4-modal-notice no-print">
          {printDispatched ? (
            <div className="notice-dispatched">
              <CheckCircle2 size={15} />
              <span>
                <strong>Print command dispatched to browser:</strong> Verify your A4 paper or PDF destination in the print dialog. Note: Web standards do not disclose physical hardware printer status.
              </span>
            </div>
          ) : isDraft ? (
            <div className="notice-draft">
              <AlertCircle size={15} />
              <span>
                <strong>Draft Preview Notice:</strong> This preview is for verification only. Stock is never deducted for drafts. Finalize the sale to generate an official invoice.
              </span>
            </div>
          ) : (
            <div className="notice-safe">
              <ShieldCheck size={15} />
              <span>
                <strong>Finalized Record:</strong> This invoice was retrieved from verified store records. Printing or re-printing will never create duplicate sales or deduct stock a second time.
              </span>
            </div>
          )}
        </div>

        {/* Scrollable A4 Sheet Viewer */}
        <div className="a4-sheet-scroller">
          <InvoiceA4 sale={sale} isDraft={isDraft} language={language} />
        </div>
      </div>
    </div>
  );
};
