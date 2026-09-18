import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Loader2, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/cn';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  docType: string;
}

export function PaymentsModal({ isOpen, onClose, onSuccess, amount, docType }: PaymentsModalProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  function handlePay() {
    setStatus('processing');
    // Simulate ALATPay API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        setStatus('idle');
      }, 1500);
    }, 2000);
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
              <button onClick={onClose} disabled={status === 'processing'} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {status === 'success' ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-emerald-100 p-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </motion.div>
                  <p className="mt-4 font-display text-lg font-bold text-ink-900">Payment Successful</p>
                  <p className="mt-1 text-sm text-slate-500">Your document is now queued for verification.</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-500">Processing fee for</p>
                    <p className="mt-1 font-display text-lg font-bold text-ink-900">{docType}</p>
                    <p className="mt-4 font-display text-4xl font-extrabold text-ink-900">₦{amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <button
                      onClick={handlePay}
                      disabled={status === 'processing'}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-70"
                    >
                      {status === 'processing' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Processing with ALATPay...
                        </>
                      ) : (
                        `Pay ₦${amount.toLocaleString()}`
                      )}
                    </button>
                    <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Secured by ALATPay
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
