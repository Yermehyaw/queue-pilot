import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Loader2, X, CheckCircle2, Landmark, Copy } from 'lucide-react';
import { cn } from '../lib/cn';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  docType: string;
}

type Step = 'method' | 'card' | 'transfer' | 'processing' | 'success';

export function PaymentsModal({ isOpen, onClose, onSuccess, amount, docType }: PaymentsModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setCopied(false);
    }
  }, [isOpen]);

  function handleProcess() {
    setStep('processing');
    // Simulate ALATPay API call
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  }

  function handleCopy() {
    navigator.clipboard.writeText('0123456789');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200/50"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <div className="flex items-center gap-2 text-ink-900">
                <CreditCard className="h-5 w-5 text-violet-600" />
                <h3 className="font-display text-base font-bold">ALATPay Checkout</h3>
              </div>
              <button onClick={onClose} disabled={step === 'processing'} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm font-semibold text-slate-500">Processing fee for {docType}</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-ink-900">₦{amount.toLocaleString()}</p>
              </div>

              <AnimatePresence mode="wait">
                {step === 'method' && (
                  <motion.div key="method" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                    <button onClick={() => setStep('card')} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-300 hover:bg-violet-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-900">Pay with Card</p>
                        <p className="text-[11px] text-slate-500">Visa, Mastercard, Verve</p>
                      </div>
                    </button>
                    <button onClick={() => setStep('transfer')} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-300 hover:bg-violet-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-900">Bank Transfer</p>
                        <p className="text-[11px] text-slate-500">Direct transfer to Wema Bank</p>
                      </div>
                    </button>
                  </motion.div>
                )}

                {step === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Expiry (MM/YY)</label>
                        <input type="text" placeholder="12/25" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">CVV</label>
                        <input type="password" placeholder="123" maxLength={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button onClick={() => setStep('method')} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
                        Back
                      </button>
                      <button onClick={handleProcess} className="flex-[2] rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-500">
                        Pay ₦{amount.toLocaleString()}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'transfer' && (
                  <motion.div key="transfer" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Wema Bank</p>
                      <p className="mt-2 font-display text-2xl font-extrabold tracking-widest text-ink-900">0123456789</p>
                      <p className="mt-1 text-xs text-slate-500">Luma Payments</p>
                      <button onClick={handleCopy} className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-violet-600 transition">
                        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} 
                        {copied ? 'Copied' : 'Copy Number'}
                      </button>
                    </div>
                    <p className="text-center text-[13px] font-medium text-slate-500">Transfer exactly <strong>₦{amount.toLocaleString()}</strong> to the account above.</p>
                    <div className="pt-2 flex gap-2">
                      <button onClick={() => setStep('method')} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
                        Back
                      </button>
                      <button onClick={handleProcess} className="flex-[2] rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-500">
                        I have transferred
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                    <p className="mt-4 font-display text-lg font-bold text-ink-900">Processing Payment</p>
                    <p className="mt-1 text-sm text-slate-500">Please wait while we confirm your payment securely.</p>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-emerald-100 p-3">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </motion.div>
                    <p className="mt-4 font-display text-lg font-bold text-ink-900">Payment Successful</p>
                    <p className="mt-1 text-sm text-slate-500">Your document is now queued for verification.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secured by ALATPay</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
