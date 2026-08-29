'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Activity, ShieldCheck, Languages, ArrowRight, Zap, Play, Send, 
  Volume2, VolumeX, Phone, PhoneOff, MessageSquare, CheckCircle, XCircle, Clock, 
  Sparkles, Gauge, Trash2, CheckCircle2, User, Bot, RotateCcw, CreditCard, Smartphone,
  Calendar, RefreshCw, Percent, ShieldAlert, Split, FileText, Gift, Ban, ChevronRight
} from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  initialGreeting: string;
}

interface MessageTurn {
  id: string;
  role: 'customer' | 'agent';
  text: string;
  timestamp: string;
  lang: string;
  intent?: string;
  quickReplies?: string[];
}

interface QuickScenario {
  id: string;
  title: string;
  icon: any;
  color: string;
  prompts: Record<string, string>; // Language-specific prompts
  aiReplies: Record<string, string>; // Language-specific AI questions
  quickReplies: Record<string, string[]>; // Interactive quick action chips
  intent: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { 
    code: 'en-IN', 
    name: 'English', 
    nativeName: 'English', 
    initialGreeting: 'Hello! This is an automated call from Razorpay. How can we assist you with completing your transaction today?'
  },
  { 
    code: 'kn-IN', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    initialGreeting: 'ನಮಸ್ಕಾರ! Razorpay ನಿಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇವೆ. ನಿಮ್ಮ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಲು ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?'
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिंदी', 
    initialGreeting: 'नमस्ते! Razorpay से कॉल कर रहे हैं। आपके पेमेंट को पूरा करने में हम आपकी किस प्रकार सहायता कर सकते हैं?'
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    initialGreeting: 'வணக்கம்! Razorpay இலிருந்து அழைக்கிறோம். உங்கள் கட்டணத்தை முடிக்க நாங்கள் எவ்வாறு உதவலாம்?'
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    initialGreeting: 'నమస్కారం! Razorpay నుండి కాల్ చేస్తున్నాము. మీ చెల్లింపు పూర్తి చేయడానికి మేము ఎలా సహాయపడగలము?'
  },
  { 
    code: 'ml-IN', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    initialGreeting: 'നമസ്കാരം! Razorpay-ൽ നിന്നാണ് വിളിക്കുന്നത്. നിങ്ങളുടെ പേയ്‌മെന്റ് പൂർത്തിയാക്കാൻ ഞങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാനാകും?'
  }
];

// 10 Interactive Fintech Scenarios with Strict Multi-Language Dialogue & Quick-Reply Options
const QUICK_SCENARIOS: QuickScenario[] = [
  {
    id: 'split',
    title: '1. Split / Installment',
    icon: Split,
    color: 'text-indigo-400 border-indigo-900/40 bg-indigo-950/30',
    intent: 'SPLIT_PAYMENT',
    prompts: {
      'English': 'Can I pay half now and the remaining balance next week?',
      'Kannada': 'ನಾನು ಈಗ ಅರ್ಧ ಹಣ ಕಟ್ಟಿ, ಉಳಿದ ಹಣವನ್ನು ಮುಂದಿನ ವಾರ ಕಟ್ಟಬಹುದೇ?',
      'Hindi': 'क्या मैं आधा भुगतान अभी और बाकी अगले हफ्ते कर सकता हूँ?'
    },
    aiReplies: {
      'English': 'Yes! Would you like to pay half (₹2,325) right now via UPI, and schedule the remaining balance for next week?',
      'Kannada': 'ಖಂಡಿತ! ನೀವು ಈಗ ಅರ್ಧ ಮೊತ್ತವನ್ನು (₹2,325) ಯುಪಿಐ ಮೂಲಕ ಪಾವತಿಸಿ, ಉಳಿದ ಮೊತ್ತವನ್ನು ಮುಂದಿನ ವಾರ ಪಾವತಿಸಲು ಬಯಸುತ್ತೀರಾ?',
      'Hindi': 'जी हाँ! क्या आप अभी आधा (₹2,325) यूपीआई से देकर बाकी अगले हफ्ते देना चाहेंगे?'
    },
    quickReplies: {
      'English': ['✓ Pay Half Now (₹2,325)', 'Check 3-Month EMI', 'Pay Full Amount'],
      'Kannada': ['✓ ಈಗ ಅರ್ಧ ಪಾವತಿಸಿ (₹2,325)', '3 ತಿಂಗಳ EMI ಪರಿಶೀಲಿಸಿ', 'ಪೂರ್ಣ ಮೊತ್ತ ಪಾವತಿಸಿ'],
      'Hindi': ['✓ अभी आधा दें (₹2,325)', '3 महीने की EMI देखें', 'पूरा भुगतान करें']
    }
  },
  {
    id: 'card_decline',
    title: '2. Card Declined',
    icon: CreditCard,
    color: 'text-red-400 border-red-900/40 bg-red-950/30',
    intent: 'CARD_DECLINE',
    prompts: {
      'English': 'Why was my card declined during checkout?',
      'Kannada': 'ಚೆಕ್‌ಔಟ್ ಸಮಯದಲ್ಲಿ ನನ್ನ ಕಾರ್ಡ್ ಏಕೆ ವಿಫಲವಾಯಿತು?',
      'Hindi': 'पेमेंट करते समय मेरा कार्ड डिक्लाइन क्यों हुआ?'
    },
    aiReplies: {
      'English': 'We noticed a temporary bank gateway timeout on your card. Would you prefer an instant 1-tap UPI link on WhatsApp, or retry your card in 10 minutes?',
      'Kannada': 'ಬ್ಯಾಂಕ್ ಸರ್ವರ್ ಸಮಸ್ಯೆಯಿಂದ ಕಾರ್ಡ್ ಪಾವತಿ ವಿಫಲವಾಗಿದೆ. ವಾಟ್ಸಾಪ್‌ಗೆ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲೆ ಅಥವಾ 10 ನಿಮಿಷಗಳಲ್ಲಿ ಮರುಪ್ರಯತ್ನಿಸುತ್ತೀರಾ?',
      'Hindi': 'बैंक सर्वर में दिक्कत के कारण कार्ड फेल हुआ। क्या आप व्हाट्सएप पर 1-टैप यूपीआई लिंक चाहते हैं?'
    },
    quickReplies: {
      'English': ['📲 Send 1-Tap UPI Link', '🔄 Retry Card in 10 mins', 'Check Bank Status'],
      'Kannada': ['📲 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಿ', '🔄 10 ನಿಮಿಷದಲ್ಲಿ ಮರುಪ್ರಯತ್ನಿಸಿ'],
      'Hindi': ['📲 1-टैप यूपीआई लिंक भेजें', '🔄 10 मिनट बाद पुनः प्रयास करें']
    }
  },
  {
    id: 'upi_switch',
    title: '3. Switch to UPI',
    icon: Smartphone,
    color: 'text-blue-400 border-blue-900/40 bg-blue-950/30',
    intent: 'UPI_SWITCH',
    prompts: {
      'English': 'Can you send a 1-tap Google Pay / PhonePe link to my WhatsApp?',
      'Kannada': 'ನನ್ನ ವಾಟ್ಸಾಪ್‌ಗೆ ಗೂಗಲ್ ಪೇ ಅಥವಾ ಫೋನ್‌ಪೇ ಲಿಂಕ್ ಕಳುಹಿಸಬಹುದೇ?',
      'Hindi': 'क्या आप मेरे व्हाट्सएप पर गूगल पे या फोनपे लिंक भेज सकते हैं?'
    },
    aiReplies: {
      'English': 'Sure! Which UPI app do you prefer: Google Pay, PhonePe, or Paytm? We will deliver the link to your WhatsApp immediately.',
      'Kannada': 'ಖಂಡಿತ! ನೀವು ಯಾವ ಆ್ಯಪ್ ಬಳಸುತ್ತೀರಿ: Google Pay, PhonePe ಅಥವಾ Paytm? ಇವಾಗ್ಲೇ ವಾಟ್ಸಾಪ್‌ಗೆ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ.',
      'Hindi': 'जी बिल्कुल! आप कौन सा ऐप इस्तेमाल करते हैं: Google Pay, PhonePe या Paytm?'
    },
    quickReplies: {
      'English': ['Google Pay', 'PhonePe', 'Paytm UPI', 'CRED UPI'],
      'Kannada': ['Google Pay', 'PhonePe', 'Paytm', 'CRED'],
      'Hindi': ['Google Pay', 'PhonePe', 'Paytm']
    }
  },
  {
    id: 'refund',
    title: '4. Refund Double-Debit',
    icon: RefreshCw,
    color: 'text-emerald-400 border-emerald-900/40 bg-emerald-950/30',
    intent: 'REFUND_REQUEST',
    prompts: {
      'English': 'Money was debited from my bank account but order failed. Please refund it.',
      'Kannada': 'ನನ್ನ ಖಾತೆಯಿಂದ ಹಣ ಕಟ್ ಆಗಿದೆ ಆದರೆ ಆರ್ಡರ್ ಆಗಿಲ್ಲ. ದಯವಿಟ್ಟು ರಿಫಂಡ್ ಮಾಡಿ.',
      'Hindi': 'पैसे कट गए लेकिन आर्डर नहीं हुआ। कृपया रिफंड करें।'
    },
    aiReplies: {
      'English': 'Don\'t worry! We are issuing an instant T+0 reversal of ₹4,650 to your account in 2.1 seconds. Your UTR has been sent to WhatsApp.',
      'Kannada': 'ಚಿಂತೆ ಮಾಡಬೇಡಿ! ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ 2.1 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ₹4,650 ರಿಫಂಡ್ ಜಮೆ ಮಾಡಲಾಗುತ್ತಿದೆ. UTR ಸಂಖ್ಯೆಯನ್ನು ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.',
      'Hindi': 'चिंता न करें! ₹4,650 का रिफंड 2 सेकंड में आपके खाते में भेजा जा रहा है।'
    },
    quickReplies: {
      'English': ['✓ Verify Bank UTR', 'Claim 5% Store Credit (+₹232)', 'Talk to Support Desk'],
      'Kannada': ['✓ UTR ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ', '5% ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ ಪಡೆಯಿರಿ'],
      'Hindi': ['✓ UTR स्टेटस चेक करें', '5% स्टोर क्रेडिट लें']
    }
  },
  {
    id: 'discounts',
    title: '5. Discounts & Offers',
    icon: Percent,
    color: 'text-purple-400 border-purple-900/40 bg-purple-950/30',
    intent: 'PRICE_DISCOUNT',
    prompts: {
      'English': 'Are there any cashback or discount offers available on UPI?',
      'Kannada': 'ಯುಪಿಐ ಪಾವತಿಗೆ ಯಾವುದೇ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಅಥವಾ ಡಿಸ್ಕೌಂಟ್ ಆಫರ್ ಇದೆಯೇ?',
      'Hindi': 'क्या यूपीआई से पेमेंट करने पर कोई डिस्काउंट या ऑफर है?'
    },
    aiReplies: {
      'English': 'We have an instant 5% cashback discount available on 1-Tap UPI payments today. Would you like me to apply promo code SAVE5 to your payment link?',
      'Kannada': 'ಇಂದು 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಪಾವತಿಗೆ 5% ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಆಫರ್ ಲಭ್ಯವಿದೆ. ನಿಮ್ಮ ಪಾವತಿ ಲಿಂಕ್‌ಗೆ SAVE5 ಕೂಪನ್ ಅನ್ವಯಿಸಬೇಕೆ?',
      'Hindi': 'आज 1-टैप यूपीआई पर 5% कैशबैक ऑफर है। क्या आपके लिंक पर SAVE5 कोड लगा दें?'
    },
    quickReplies: {
      'English': ['✓ Apply SAVE5 (5% Off)', 'View Bank Credit Card Offers', 'No, Pay Regular Amount'],
      'Kannada': ['✓ SAVE5 ಕೂಪನ್ ಅನ್ವಯಿಸಿ', 'ಬ್ಯಾಂಕ್ ಕಾರ್ಡ್ ಆಫರ್ ನೋಡಿ'],
      'Hindi': ['✓ SAVE5 कोड लगाएं', 'अन्य बैंक ऑफर देखें']
    }
  },
  {
    id: 'schedule',
    title: '6. Schedule Tomorrow',
    icon: Calendar,
    color: 'text-amber-400 border-amber-900/40 bg-amber-950/30',
    intent: 'PROMISE_TO_PAY',
    prompts: {
      'English': 'Can I schedule this payment for tomorrow morning?',
      'Kannada': 'ನಾನು ಈ ಪಾವತಿಯನ್ನು ನಾಳೆ ಬೆಳಗ್ಗೆ ಮಾಡಲು ನಿಗದಿಪಡಿಸಬಹುದೇ?',
      'Hindi': 'क्या मैं यह पेमेंट कल सुबह कर सकता हूँ?'
    },
    aiReplies: {
      'English': 'Understood! What time tomorrow works best for you: 9:00 AM or 11:30 AM before banking hours?',
      'Kannada': 'ಖಂಡಿತ! ನಾಳೆ ಯಾವ ಸಮಯ ನಿಮಗೆ ಅನುಕೂಲಕರ: ಬೆಳಗ್ಗೆ 9:00 ಗಂಟೆಗೆ ಅಥವಾ ಮಧ್ಯಾಹ್ನ 11:30 ಕ್ಕೆ?',
      'Hindi': 'जी ठीक है! कल किस समय लिंक भेजें: सुबह 9:00 बजे या 11:30 बजे?'
    },
    quickReplies: {
      'English': ['Tomorrow 9:00 AM', 'Tomorrow 11:30 AM', 'Tomorrow Evening (7 PM)'],
      'Kannada': ['ನಾಳೆ ಬೆಳಗ್ಗೆ 9:00 AM', 'ನಾಳೆ ಮಧ್ಯಾಹ್ನ 11:30 AM', 'ನಾಳೆ ಸಂಜೆ 7:00 PM'],
      'Hindi': ['कल सुबह 9:00 बजे', 'कल दोपहर 11:30 बजे', 'कल शाम 7:00 बजे']
    }
  },
  {
    id: 'security',
    title: '7. Security & Fraud Check',
    icon: ShieldAlert,
    color: 'text-cyan-400 border-cyan-900/40 bg-cyan-950/30',
    intent: 'FRAUD_CHECK',
    prompts: {
      'English': 'Is this transaction safe? I want to verify the payment details before paying.',
      'Kannada': 'ಈ ಪಾವತಿ ಸುರಕ್ಷಿತವಾಗಿದೆಯೇ? ನಾನು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುತ್ತೇನೆ.',
      'Hindi': 'क्या यह ट्रांजैक्शन सुरक्षित है? मैं पुष्टि करना चाहता हूँ।'
    },
    aiReplies: {
      'English': 'Security is our highest priority. This ₹4,650 charge is 256-bit encrypted by Razorpay. Would you like us to verify transaction details or freeze the order?',
      'Kannada': 'ನಿಮ್ಮ ಸುರಕ್ಷತೆ ನಮ್ಮ ಮೊದಲ ಆದ್ಯತೆ. ಇದು Razorpay ನಿಂದ 256-bit ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ. ವಿವರ ಪರಿಶೀಲಿಸಬೇಕೆ?',
      'Hindi': 'सुरक्षा हमारी पहली प्राथमिकता है। यह Razorpay 256-bit सुरक्षित है। क्या विवरण चेक करना चाहते हैं?'
    },
    quickReplies: {
      'English': ['✓ Verify & Pay Safely', 'Freeze Transaction', 'Request Fraud Audit'],
      'Kannada': ['✓ ಪರಿಶೀಲಿಸಿ ಪಾವತಿಸಿ', 'ವಹಿವಾಟು ರದ್ದುಗೊಳಿಸಿ'],
      'Hindi': ['✓ सुरक्षित पेमेंट करें', 'फ्रीज करें']
    }
  },
  {
    id: 'gst',
    title: '8. Corporate GST Invoice',
    icon: FileText,
    color: 'text-teal-400 border-teal-900/40 bg-teal-950/30',
    intent: 'GST_INVOICE',
    prompts: {
      'English': 'Can you generate a B2B GST tax invoice for my company with this payment?',
      'Kannada': 'ನನ್ನ ಕಂಪನಿಗೆ B2B GST ತೆರಿಗೆ ಇನ್‌ವಾಯ್ಸ್ ನೀಡಬಹುದೇ?',
      'Hindi': 'क्या मेरी कंपनी के लिए B2B GST टैक्स इनवॉइस मिल सकता है?'
    },
    aiReplies: {
      'English': 'Certainly! Would you like a B2B tax invoice generated with your company GSTIN upon payment completion?',
      'Kannada': 'ಖಂಡಿತ! ಪಾವತಿ ಮುಗಿದ ತಕ್ಷಣ ನಿಮ್ಮ ಕಂಪನಿ GST ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಅಧಿಕೃತ ಇನ್‌ವಾಯ್ಸ್ ಕಳುಹಿಸಬೇಕೆ?',
      'Hindi': 'जी बिल्कुल! क्या पेमेंट के साथ आपकी कंपनी का GSTIN जोड़ दें?'
    },
    quickReplies: {
      'English': ['✓ Attach Company GSTIN', 'Send Simple Receipt', 'Email Tax Invoice'],
      'Kannada': ['✓ ಕಂಪನಿ GST ಸೇರಿಸಿ', 'ಸಾಮಾನ್ಯ ರಶೀದಿ ಕಳುಹಿಸಿ'],
      'Hindi': ['✓ GSTIN जोड़ें', 'ईमेल पर इनवॉइस भेजें']
    }
  },
  {
    id: 'store_credit',
    title: '9. 5% Store Credit Boost',
    icon: Gift,
    color: 'text-pink-400 border-pink-900/40 bg-pink-950/30',
    intent: 'STORE_CREDIT',
    prompts: {
      'English': 'Can I convert this into store credit with a 5% bonus perk?',
      'Kannada': 'ನಾನು ಇದನ್ನು 5% ಬೋನಸ್‌ನೊಂದಿಗೆ ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್‌ಗೆ ಪರಿವರ್ತಿಸಬಹುದೇ?',
      'Hindi': 'क्या मुझे 5% अतिरिक्त बोनस के साथ स्टोर क्रेडिट मिल सकता है?'
    },
    aiReplies: {
      'English': 'Instead of waiting for bank settlement, would you like an instant ₹4,882 store credit voucher (including a 5% bonus) to complete your order immediately?',
      'Kannada': 'ಖಂಡಿತ! ₹4,882 ಮೌಲ್ಯದ ತಕ್ಷಣದ ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ ವೋಚರ್ (5% ಬೋನಸ್ ಸೇರಿದಂತೆ) ನೀಡಬೇಕೆ?',
      'Hindi': 'जी हाँ! क्या आपको ₹4,882 का तुरंत स्टोर वाउचर (5% बोनस के साथ) जारी कर दें?'
    },
    quickReplies: {
      'English': ['✓ Issue ₹4,882 Voucher Now', 'Prefer Direct Bank Refund'],
      'Kannada': ['✓ ₹4,882 ವೋಚರ್ ಪಡೆಯಿರಿ', 'ಬ್ಯಾಂಕ್ ರಿಫಂಡ್ ಬೇಕು'],
      'Hindi': ['✓ ₹4,882 वाउचर जारी करें', 'बैंक रिफंड चाहिए']
    }
  },
  {
    id: 'cancel',
    title: '10. Cancel Order (Opt-Out)',
    icon: Ban,
    color: 'text-rose-400 border-rose-900/40 bg-rose-950/30',
    intent: 'OPT_OUT',
    prompts: {
      'English': 'I want to cancel my order and stop all future payment calls.',
      'Kannada': 'ನನ್ನ ಆರ್ಡರ್ ಅನ್ನು ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ ಮತ್ತು ಮುಂದಿನ ಕರೆಗಳನ್ನು ನಿಲ್ಲಿಸಿ.',
      'Hindi': 'मेरा आर्डर कैंसिल करें और आगे से कॉल बंद करें।'
    },
    aiReplies: {
      'English': 'We respect your decision. Your order has been cancelled and all future recovery calls have been paused. Have a wonderful day!',
      'Kannada': 'ಖಂಡಿತ, ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಈ ಆರ್ಡರ್ ಅನ್ನು ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲಾಗಿದೆ. ನಾವು ಇನ್ನು ಮುಂದೆ ಕರೆ ಮಾಡುವುದಿಲ್ಲ. ಧನ್ಯವಾದಗಳು!',
      'Hindi': 'आपके अनुरोध पर ऑर्डर रद्द कर दिया गया है और कॉल बंद कर दी गई हैं। आपका दिन शुभ हो!'
    },
    quickReplies: {
      'English': ['✓ Confirm Order Cancellation', 'Send Cancellation SMS'],
      'Kannada': ['✓ ಕ್ಯಾನ್ಸಲ್ ಖಚಿತಪಡಿಸಿ', 'SMS ರಶೀದಿ ಕಳುಹಿಸಿ'],
      'Hindi': ['✓ कैंसिलेशन की पुष्टि करें', 'SMS भेजें']
    }
  }
];

export default function VoiceRecovery() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]); // Default English
  const [callState, setCallState] = useState<'IDLE' | 'LISTENING' | 'ANALYZING' | 'AI_SPEAKING'>('IDLE');
  const [callDuration, setCallDuration] = useState(12);
  const [currentSpokenText, setCurrentSpokenText] = useState("");
  const [conversationHistory, setConversationHistory] = useState<MessageTurn[]>([
    {
      id: "msg-0",
      role: "agent",
      text: SUPPORTED_LANGUAGES[0].initialGreeting,
      timestamp: "00:02",
      lang: "English"
    }
  ]);
  
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [customText, setCustomText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Switch Language & Reset Call cleanly
  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLang(lang);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setCallState('IDLE');
    setCurrentSpokenText("");
    setParsedIntent(null);
    setShowWhatsAppPopup(false);

    setConversationHistory([
      {
        id: `msg-${Date.now()}`,
        role: 'agent',
        text: lang.initialGreeting,
        timestamp: formatCallTime(callDuration),
        lang: lang.name
      }
    ]);
  };

  // Call timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll conversation history to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, callState]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Speak AI Audio response
  const speakAIResponse = (text: string, langCode: string, onFinish?: () => void) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onFinish) onFinish();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setCallState('IDLE');
      if (onFinish) onFinish();
    };

    utterance.onerror = () => {
      setCallState('IDLE');
      if (onFinish) onFinish();
    };

    setCallState('AI_SPEAKING');
    window.speechSynthesis.speak(utterance);
  };

  // Step 1: Start User Speaking
  const startListening = () => {
    setRecognitionError(null);
    setCurrentSpokenText("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Speech recognition not supported in this browser. Please open in Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang.code;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setCallState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
        setCurrentSpokenText(fullTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setRecognitionError("Microphone permission denied. Please allow microphone in your browser bar.");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setRecognitionError("Failed to initialize microphone.");
      setCallState('IDLE');
    }
  };

  // Step 2: User explicitly finishes speaking
  const finishSpeakingAndAnalyze = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const textToProcess = currentSpokenText.trim();
    if (!textToProcess || textToProcess.length < 2) {
      setCurrentSpokenText("");
      setCallState('IDLE');
      return;
    }

    const customerMsg: MessageTurn = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      text: textToProcess,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    };

    const updatedHistory = [...conversationHistory, customerMsg];
    setConversationHistory(updatedHistory);
    setCurrentSpokenText("");
    
    processTurn(textToProcess, updatedHistory);
  };

  // Step 3: Handle typed text or quick-reply chip click
  const handleTurnSubmit = (textToSubmit: string) => {
    if (!textToSubmit.trim() || callState !== 'IDLE') return;

    const customerMsg: MessageTurn = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      text: textToSubmit,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    };

    const updatedHistory = [...conversationHistory, customerMsg];
    setConversationHistory(updatedHistory);
    setCustomText("");

    processTurn(textToSubmit, updatedHistory);
  };

  // Step 4: Click one of the 10 Scenario Buttons (Strict 1-to-1 language mapping!)
  const handleScenarioClick = (scenario: QuickScenario) => {
    if (callState !== 'IDLE') return;

    const langName = selectedLang.name;
    const promptText = scenario.prompts[langName] || scenario.prompts['English'];
    const aiReplyText = scenario.aiReplies[langName] || scenario.aiReplies['English'];
    const chips = scenario.quickReplies[langName] || scenario.quickReplies['English'];

    const customerMsg: MessageTurn = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      text: promptText,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    };

    const isCancellation = scenario.intent === 'OPT_OUT';

    const agentMsg: MessageTurn = {
      id: `agent-${Date.now() + 1}`,
      role: 'agent',
      text: aiReplyText,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name,
      intent: scenario.intent,
      quickReplies: chips
    };

    setConversationHistory(prev => [...prev, customerMsg, agentMsg]);

    setParsedIntent({
      intent: scenario.intent,
      language: selectedLang.name,
      sentiment: isCancellation ? "Refusal / Cancellation" : "Positive (Engaged)",
      confidence: 99,
      willingness: isCancellation ? "Negative (Cancelled)" : "Positive (Engaged)",
      method: isCancellation ? "None" : (scenario.intent === 'STORE_CREDIT' ? 'Store Credit' : 'UPI (Google Pay / PhonePe)'),
      date: scenario.intent === 'PROMISE_TO_PAY' ? 'Tomorrow morning' : 'Immediate',
      action: isCancellation ? 'Halt automated outreach. Order cancelled.' : `Guided recovery flow for ${scenario.title}`
    });

    if (!isCancellation && scenario.intent !== 'REFUND_REQUEST') {
      setShowWhatsAppPopup(true);
    } else {
      setShowWhatsAppPopup(false);
    }

    speakAIResponse(aiReplyText, selectedLang.code, () => {
      setCallState('IDLE');
    });
  };

  // Step 5: Process spoken/typed text turns
  const processTurn = async (text: string, currentHistory: MessageTurn[]) => {
    setCallState('ANALYZING');
    
    try {
      let intentData: any = null;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/voice/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            utterance: text, 
            session_id: "session_9042",
            history: currentHistory.map(h => ({ role: h.role, text: h.text }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          intentData = data.extracted_data;
        }
      } catch (e) {
        console.warn("Backend offline, using local scenario engine.");
      }

      // Exact client-side regex fallback
      if (!intentData || intentData.intent === "UNKNOWN" || !intentData.intent) {
        const t = text.toLowerCase().trim();

        // 1. Split payment
        if (/\b(half|split|installment|installments|two parts|emi|ಭಾಗ|ಅರ್ಧ)\b/i.test(t)) {
          intentData = {
            intent: "SPLIT_PAYMENT",
            sentiment: "Positive (Installments)",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಖಂಡಿತ! ನೀವು ಈಗ ಅರ್ಧ ಮೊತ್ತವನ್ನು (₹2,325) ಯುಪಿಐ ಮೂಲಕ ಪಾವತಿಸಿ, ಉಳಿದ ಮೊತ್ತವನ್ನು ಮುಂದಿನ ವಾರ ಪಾವತಿಸಲು ಬಯಸುತ್ತೀರಾ?"
              : "Yes! Would you like to pay half (₹2,325) right now via UPI, and schedule the remaining balance for next week?",
            recommended_action: "Generate 2-part split payment link via Razorpay"
          };
        }
        // 2. Cancellation
        else if (/\b(cancel my order|cancel order|cancel it|dont want|don't want|not interested|stop calling|refuse|ಬೇಡ|ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ)\b/i.test(t)) {
          intentData = {
            intent: "OPT_OUT",
            sentiment: "Refusal / Cancellation",
            confidence_score: 98,
            willingness_to_pay: false,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಖಂಡಿತ, ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಈ ಆರ್ಡರ್ ಅನ್ನು ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲಾಗಿದೆ. ನಾವು ಇನ್ನು ಮುಂದೆ ಕರೆ ಮಾಡುವುದಿಲ್ಲ."
              : "We respect your decision. Your order has been cancelled and all future recovery calls have been paused.",
            recommended_action: "Halt automated outreach immediately."
          };
        }
        // 3. Card decline
        else if (/\b(card.*failed|card.*not working|card decline|declined|server down|bank timeout|ಕಾರ್ಡ್.*ಆಗ್ತಿಲ್ಲ)\b/i.test(t)) {
          intentData = {
            intent: "CARD_DECLINE",
            sentiment: "Technical Complaint",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಬ್ಯಾಂಕ್ ಸರ್ವರ್ ಸಮಸ್ಯೆಯಿಂದ ಕಾರ್ಡ್ ಪಾವತಿ ವಿಫಲವಾಗಿದೆ. ವಾಟ್ಸಾಪ್‌ಗೆ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲೆ ಅಥವಾ 10 ನಿಮಿಷಗಳಲ್ಲಿ ಮರುಪ್ರಯತ್ನಿಸುತ್ತೀರಾ?"
              : "We noticed a temporary bank gateway timeout on your card. Would you prefer an instant 1-tap UPI link on WhatsApp, or retry your card in 10 minutes?",
            recommended_action: "Offer smart UPI auto-reroute"
          };
        }
        // 4. Quick-reply confirmations
        else if (/\b(yes|pay|send|confirm|okay|done|ಆಯ್ತು|ಸರಿ|ಹೌದು)\b/i.test(t)) {
          intentData = {
            intent: "CONFIRMATION",
            sentiment: "Positive",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಖಚಿತಪಡಿಸಲಾಗಿದೆ ಮತ್ತು ಪಾವತಿ ಲಿಂಕ್ ಅನ್ನು ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ."
              : "Thank you! Your request has been confirmed and the payment link has been delivered to your WhatsApp.",
            recommended_action: "Delivered 1-Tap UPI WhatsApp Deep Link"
          };
        }
        // Default
        else {
          intentData = {
            intent: "GENERAL_QUERY",
            sentiment: "Neutral",
            confidence_score: 95,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಾವು ಗಮನಿಸಿದ್ದೇವೆ. ಸಹಾಯ ಮಾಡಲು ನಮ್ಮ ತಂಡ ಇಲ್ಲಿದೆ."
              : "Thank you for the update. I have noted your details and our team is assisting you right away.",
            recommended_action: "Logged conversation and assigned priority recovery strategy"
          };
        }
      }

      const aiReplyText = intentData.ai_spoken_reply || "I am listening to help you complete your transaction.";
      const isCancellation = intentData.intent === "OPT_OUT";

      setParsedIntent({
        intent: intentData.intent || "GENERAL_QUERY",
        language: selectedLang.name,
        sentiment: intentData.sentiment || "Positive",
        confidence: intentData.confidence_score || 96,
        willingness: isCancellation ? "Negative (Cancelled)" : "Positive (Engaged)",
        method: intentData.payment_method || (isCancellation ? "None" : "UPI (Google Pay / PhonePe)"),
        date: intentData.requested_date || "Immediate",
        action: intentData.recommended_action || "Autonomous Strategy Updated"
      });

      if (!isCancellation && intentData.intent !== 'REFUND_REQUEST') {
        setShowWhatsAppPopup(true);
      } else {
        setShowWhatsAppPopup(false);
      }

      const agentMsg: MessageTurn = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: aiReplyText,
        timestamp: formatCallTime(callDuration),
        lang: selectedLang.name,
        intent: intentData.intent
      };

      setConversationHistory(prev => [...prev, agentMsg]);

      speakAIResponse(aiReplyText, selectedLang.code, () => {
        setCallState('IDLE');
      });

    } catch (err) {
      console.error("Turn processing error:", err);
      setCallState('IDLE');
    }
  };

  const clearCallHistory = () => {
    setConversationHistory([{
      id: `msg-${Date.now()}`,
      role: 'agent',
      text: selectedLang.initialGreeting,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    }]);
    setParsedIntent(null);
    setShowWhatsAppPopup(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6 md:p-10 font-sans">
      
      {/* Header */}
      <header className="mb-6 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Phone className="mr-2.5 text-blue-500" size={24} />
              Conversational Voice Recovery Agent (Airtel / GPay Style)
            </h1>
            <span className="flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              Live Call: {formatCallTime(callDuration)}
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            10 interactive recovery queries. Click any topic or tap mic to speak in your preferred dialect.
          </p>
        </div>

        {/* Dialect Selector & Audio Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center transition ${
              ttsEnabled 
                ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                : 'bg-slate-900 border-gray-800 text-gray-500'
            }`}
          >
            {ttsEnabled ? <Volume2 size={15} className="mr-1.5" /> : <VolumeX size={15} className="mr-1.5" />}
            Audio: {ttsEnabled ? 'ON' : 'MUTED'}
          </button>

          <div className="flex items-center bg-slate-900 border border-gray-800 p-1 rounded-xl">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedLang.code === lang.code
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 10 Interactive Chatbot Queries (Airtel / GPay Style) */}
      <section className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
            <Sparkles size={12} className="mr-1.5 text-yellow-400" />
            Quick Topic Select (Instant Multi-Turn Tree):
          </span>
          <span className="text-[10px] text-blue-400 font-mono">1-Tap Query Starter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {QUICK_SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioClick(sc)}
                disabled={callState !== 'IDLE'}
                className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 hover:scale-[1.02] disabled:opacity-50 ${sc.color}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="text-[11px] font-semibold truncate text-gray-200">{sc.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        
        {/* Left 7 Columns: Live Call Thread & Interaction Center */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-gray-800 flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
          
          {/* Active Call Header */}
          <div className="p-3.5 bg-slate-950/80 border-b border-gray-800 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-semibold text-white">Rajesh Kumar (+91 98450 XXXXX)</span>
              <span className="text-blue-400 font-mono text-[11px] font-bold">({selectedLang.name})</span>
            </div>
            <button 
              onClick={clearCallHistory}
              className="text-[11px] text-gray-500 hover:text-red-400 flex items-center transition"
            >
              <Trash2 size={12} className="mr-1" /> Reset Call
            </button>
          </div>

          {/* Chronological Multi-Turn Conversation Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/40 text-xs font-sans max-h-[320px]">
            {conversationHistory.map((msg) => {
              const isCustomer = msg.role === 'customer';
              return (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex items-start space-x-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    {!isCustomer && (
                      <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        <Bot size={14} />
                      </div>
                    )}

                    <div className={`max-w-[82%] rounded-2xl p-3 shadow-md ${
                      isCustomer 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-900 border border-gray-800 text-gray-200 rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 gap-2">
                        <span className="font-bold">{isCustomer ? `Customer (${msg.lang})` : 'AI Voice Agent'}</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed text-[13px]">{msg.text}</p>
                    </div>

                    {isCustomer && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-gray-700 text-gray-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        <User size={14} />
                      </div>
                    )}
                  </div>

                  {/* Interactive Quick-Reply Action Chips (Airtel / GPay style) */}
                  {!isCustomer && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-9 pt-1 animate-fade-in">
                      {msg.quickReplies.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTurnSubmit(chip)}
                          disabled={callState !== 'IDLE'}
                          className="px-2.5 py-1 rounded-full text-[11px] bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-200 transition font-medium flex items-center hover:scale-105"
                        >
                          <ChevronRight size={11} className="mr-1 text-blue-400" />
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live Streaming Speech Buffer While Customer is Speaking */}
            {callState === 'LISTENING' && currentSpokenText && (
              <div className="flex justify-end items-start space-x-2 animate-fade-in">
                <div className="max-w-[82%] rounded-2xl p-3 bg-blue-950/60 border border-blue-500/50 text-blue-200 rounded-br-none">
                  <div className="flex items-center space-x-1.5 text-[10px] text-blue-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-bold">Speaking in real-time...</span>
                  </div>
                  <p className="italic text-[13px]">{currentSpokenText}</p>
                </div>
              </div>
            )}

            {/* Thinking Indicator */}
            {callState === 'ANALYZING' && (
              <div className="flex items-center space-x-2 text-blue-400 p-2 text-xs animate-pulse">
                <Activity size={16} className="animate-spin" />
                <span>AI Agent understanding your dialogue in {selectedLang.name}...</span>
              </div>
            )}

            {/* AI Speaking Wave Indicator */}
            {callState === 'AI_SPEAKING' && (
              <div className="flex items-center space-x-2 text-emerald-400 p-2 text-xs">
                <Volume2 size={16} className="animate-bounce" />
                <span>AI Agent speaking reply in {selectedLang.name}...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Turn-Taking Controller */}
          <div className="p-4 bg-slate-950 border-t border-gray-800">
            
            {recognitionError && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs px-3 py-1.5 rounded-lg mb-3 text-center">
                {recognitionError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              
              {/* Primary Mic Button / Done Speaking Toggle */}
              {callState === 'LISTENING' ? (
                <button
                  onClick={finishSpeakingAndAnalyze}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center justify-center transition shadow-lg animate-pulse"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  ✓ DONE SPEAKING (Send Turn)
                </button>
              ) : (
                <button
                  onClick={startListening}
                  disabled={callState === 'ANALYZING' || callState === 'AI_SPEAKING'}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center transition shadow-lg disabled:opacity-50"
                >
                  <Mic size={16} className="mr-2" />
                  TAP TO TALK ({selectedLang.name})
                </button>
              )}
            </div>

            {/* Custom Text Typing Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleTurnSubmit(customText); }} className="mt-3 flex space-x-2">
              <input 
                type="text" 
                placeholder={`Type next reply in ${selectedLang.name}...`}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                disabled={callState !== 'IDLE'}
                className="flex-1 bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button 
                type="submit"
                disabled={!customText.trim() || callState !== 'IDLE'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center disabled:opacity-50 transition"
              >
                <Send size={13} className="mr-1" /> Send
              </button>
            </form>
          </div>

        </div>

        {/* Right 5 Columns: Extracted Intelligence & Action State */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Structured Intelligence Card */}
          <div className="bg-slate-900 rounded-2xl border border-gray-800 p-5 shadow-2xl relative min-h-[290px]">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h2 className="font-bold text-white text-sm flex items-center">
                <Zap size={16} className="mr-2 text-yellow-400" />
                Live Conversational State
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono flex items-center">
                <Gauge size={10} className="mr-1" />
                {parsedIntent?.confidence || 97}% Confidence
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Primary Intent</dt>
                <dd className={`font-bold ${
                  parsedIntent?.intent === 'OPT_OUT' ? 'text-red-400' : 'text-white'
                }`}>
                  {parsedIntent?.intent || "Awaiting Scenario"}
                </dd>
              </div>

              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Dialect Active</dt>
                <dd className="font-bold text-blue-400">{selectedLang.name}</dd>
              </div>

              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Customer Sentiment</dt>
                <dd className={`font-bold ${
                  parsedIntent?.intent === 'OPT_OUT' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {parsedIntent?.sentiment || "Neutral"}
                </dd>
              </div>

              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Preferred Rail</dt>
                <dd className="font-bold text-purple-400">{parsedIntent?.method || "UPI Intent"}</dd>
              </div>
            </dl>

            <div className="mt-3.5 bg-blue-950/40 border border-blue-900/60 p-3 rounded-xl text-xs">
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-1 flex items-center">
                <Sparkles size={11} className="mr-1" />
                Autonomous Action Determined
              </p>
              <p className="text-xs font-medium text-white flex items-center">
                <ArrowRight size={13} className="mr-1.5 text-blue-400 shrink-0" />
                {parsedIntent?.action || "Listening to customer in " + selectedLang.name + " to determine optimal recovery path."}
              </p>
            </div>

          </div>

          {/* Cancellation State */}
          {parsedIntent?.intent === 'OPT_OUT' && (
            <div className="bg-slate-900 border border-red-900/60 rounded-2xl p-4 shadow-xl text-xs space-y-2 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center space-x-2 text-red-400 font-bold">
                <XCircle size={16} />
                <span>Outreach Halted (Opt-Out Confirmed)</span>
              </div>
              <p className="text-gray-400 text-[11px]">
                Customer requested cancellation. The agent logged a Do Not Contact (DNC) flag and closed the recovery ticket.
              </p>
            </div>
          )}

          {/* WhatsApp Payment Link Popup */}
          {showWhatsAppPopup && (
            <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-4 shadow-xl text-xs space-y-2 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <MessageSquare size={16} />
                  <span>WhatsApp 1-Tap Recovery Link</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Delivered ✓</span>
              </div>
              
              <div className="bg-black/60 rounded-xl p-2.5 border border-emerald-950 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Link:</span>
                  <span className="text-emerald-400 font-mono">https://rzp.io/i/RR-9042</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Phone:</span>
                  <span className="text-white font-mono">+91 98450 XXXXX</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
