import React, { useState, useEffect } from 'react';
import { usePlan } from '../../context/PlanContext';
import { PaymentService, PaymentOrder } from '../../services/paymentService';
import { Button } from '../ui/Button';
import {
  X,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Clock,
  RefreshCw,
  Check,
  Loader2,
} from 'lucide-react';

const OWNER_PHONEPE_QR_IMAGE = '/assets/aistudio/image_5570a051.png';
const QR_DURATION_SECONDS = 120; // 2 minutes

type CheckoutStep = 'enter-upi' | 'scan-qr' | 'awaiting-approval' | 'approved';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    closeCheckoutModal,
    checkoutTargetPlan,
    checkoutBilling,
    upgradeSubscription,
  } = usePlan();

  const [step, setStep] = useState<CheckoutStep>('enter-upi');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(QR_DURATION_SECONDS);
  const [activeOrder, setActiveOrder] = useState<PaymentOrder | null>(null);
  const [utrNumber, setUtrNumber] = useState('');

  // Reset modal state whenever opened
  useEffect(() => {
    if (isCheckoutModalOpen) {
      setStep('enter-upi');
      setUpiError('');
      setSecondsLeft(QR_DURATION_SECONDS);
      setActiveOrder(null);
      setUtrNumber('');
    }
  }, [isCheckoutModalOpen, checkoutTargetPlan, checkoutBilling]);

  // 2-minute countdown timer while QR code is displayed
  useEffect(() => {
    if (!isCheckoutModalOpen || step !== 'scan-qr') return;
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckoutModalOpen, step, secondsLeft]);

  // Automatic PhonePe approval check once user clicks Proceed after scanning & paying
  useEffect(() => {
    if (!isCheckoutModalOpen || step !== 'awaiting-approval') return;

    const approvalTimer = setTimeout(() => {
      completeApproval();
    }, 4000);

    return () => clearTimeout(approvalTimer);
  }, [isCheckoutModalOpen, step]);

  if (!isCheckoutModalOpen) return null;

  const planTitle =
    checkoutTargetPlan === 'basic' ? 'Basic Student Plan' : 'Premium Student Plan';
  const price =
    checkoutTargetPlan === 'basic'
      ? '₹99'
      : checkoutBilling === 'yearly'
      ? '₹1,499'
      : '₹299';
  const cadence =
    checkoutTargetPlan === 'basic'
      ? 'One-time payment • Lifetime access'
      : checkoutBilling === 'yearly'
      ? 'Per year (billed annually)'
      : 'Per month';

  const formatCountdown = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const validateUpiId = (value: string): boolean => {
    const trimmed = value.trim();
    return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9]{2,}$/.test(trimmed);
  };

  // Step 1 -> Step 2: Validate customer's UPI ID and show owner's PhonePe QR code for 2 minutes
  const handleShowQrCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = upiId.trim();
    if (!validateUpiId(cleaned)) {
      setUpiError('Please enter a valid UPI ID (for example: yourname@ybl or 9876543210@ybl)');
      return;
    }

    setUpiError('');
    const order = await PaymentService.createOrder(checkoutTargetPlan, checkoutBilling);
    setActiveOrder(order);
    setSecondsLeft(QR_DURATION_SECONDS);
    setStep('scan-qr');
  };

  // Step 2 -> Step 3: User scanned & paid on PhonePe and clicked Proceed
  const handleProceedAfterScan = () => {
    setStep('awaiting-approval');
  };

  // Step 3 -> Step 4: PhonePe payment approved -> QR code is gone & plan unlocked
  const completeApproval = async () => {
    const orderToUse =
      activeOrder ||
      (await PaymentService.createOrder(checkoutTargetPlan, checkoutBilling));

    const result = await PaymentService.processSimulatedPayment(orderToUse, 'upi', {
      upiId: upiId.trim(),
    });

    if (result.success) {
      setStep('approved');
      setTimeout(() => {
        upgradeSubscription(checkoutTargetPlan, checkoutBilling, result.paymentId);
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#111115] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-800/80 flex items-center justify-between bg-[#14141A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {planTitle}
              </span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> PhonePe / UPI Verified
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Complete Your Plan Upgrade
            </h2>
          </div>
          <button
            onClick={closeCheckoutModal}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price Summary Bar */}
        <div className="px-6 py-3.5 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{planTitle}</p>
            <p className="text-xs text-gray-400">{cadence}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">{price}</span>
            <span className="text-[11px] text-emerald-400 block font-medium">
              Instant Activation
            </span>
          </div>
        </div>

        {/* STEP 1: Enter Customer UPI ID */}
        {step === 'enter-upi' && (
          <form onSubmit={handleShowQrCode} className="p-6 space-y-5">
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  Pay via PhonePe / UPI
                </span>
                <span className="text-gray-400">PhonePe • GPay • Paytm • BHIM</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                  Enter Your UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => {
                    setUpiId(e.target.value);
                    if (upiError) setUpiError('');
                  }}
                  placeholder="e.g. yourname@ybl or 9876543210@okaxis"
                  autoFocus
                  className="w-full bg-gray-950 border border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-hidden transition-colors"
                />
                {upiError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">{upiError}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Enter your UPI ID above. Next, a PhonePe QR code will appear for 2 minutes for you to scan and pay {price}.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Pay {price} &amp; Show PhonePe QR Code</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* STEP 2: Show Owner's PhonePe QR Code for 2 Minutes */}
        {step === 'scan-qr' && (
          <div className="p-6 space-y-5">
            {/* 2-Minute Countdown Header */}
            <div className="flex items-center justify-between bg-purple-950/30 border border-purple-500/30 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-200">
                <span className="text-gray-400">UPI ID:</span>
                <span className="font-bold text-white">{upiId.trim()}</span>
                <button
                  type="button"
                  onClick={() => setStep('enter-upi')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline ml-1 cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className={secondsLeft <= 20 ? 'text-rose-400' : 'text-amber-300'}>
                  {secondsLeft > 0
                    ? `Valid for ${formatCountdown(secondsLeft)}`
                    : 'QR Expired'}
                </span>
              </div>
            </div>

            {/* Progress Bar for 2-Minute Timer */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${(secondsLeft / QR_DURATION_SECONDS) * 100}%` }}
              />
            </div>

            {/* Owner's PhonePe QR Code Card */}
            {secondsLeft > 0 ? (
              <div className="flex flex-col items-center bg-[#181820] border border-gray-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <span>Scan &amp; Pay {price} on PhonePe / Any UPI App</span>
                </div>

                <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-purple-500/40">
                  <img
                    src={OWNER_PHONEPE_QR_IMAGE}
                    alt="PhonePe Merchant QR Code"
                    className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-lg select-none"
                  />
                </div>

                <p className="text-xs text-center text-gray-300 max-w-sm leading-relaxed">
                  Open <strong>PhonePe</strong>, <strong>Google Pay</strong>, or <strong>Paytm</strong> on your phone, scan this QR code to pay <strong>{price}</strong>, and then click <strong>Proceed</strong> below.
                </p>

                <div className="w-full pt-1">
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    placeholder="Optional: Enter 12-digit UTR / Ref No. after paying"
                    className="w-full bg-gray-950 border border-gray-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-hidden text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-900/70 border border-gray-800 rounded-2xl space-y-3">
                <p className="text-sm font-bold text-rose-400">
                  The 2-minute QR session has expired.
                </p>
                <p className="text-xs text-gray-400">
                  Click below to generate a fresh 2-minute QR timer to complete your payment.
                </p>
                <Button
                  type="button"
                  onClick={() => setSecondsLeft(QR_DURATION_SECONDS)}
                  className="mx-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload QR Code (02:00)</span>
                </Button>
              </div>
            )}

            {/* Proceed Button */}
            {secondsLeft > 0 && (
              <Button
                type="button"
                onClick={handleProceedAfterScan}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Proceed (I Have Scanned &amp; Paid {price})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* STEP 3: QR Code Gone -> Waiting for Owner's PhonePe Approval */}
        {step === 'awaiting-approval' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-purple-500/15 text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
              <Loader2 className="w-9 h-9 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Verifying Payment on PhonePe...
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Payment request of <strong>{price}</strong> from UPI ID{' '}
                <strong className="text-purple-300">{upiId.trim()}</strong> has been sent for PhonePe merchant approval.
              </p>
              <p className="text-xs text-emerald-400 font-medium">
                Once approved on PhonePe, your {planTitle} will unlock automatically.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={completeApproval}
                className="mx-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment Approved on PhonePe — Activate Now</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Approved & Plan Unlocked */}
        {step === 'approved' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Approved!</h3>
            <p className="text-sm text-gray-300">
              Your PhonePe payment of <strong>{price}</strong> from{' '}
              <strong>{upiId.trim()}</strong> has been approved. Your account is now upgraded to{' '}
              <strong>{planTitle}</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
