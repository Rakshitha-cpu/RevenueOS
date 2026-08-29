'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Activity, ShieldCheck, Languages, ArrowRight, Zap, Play, Send, 
  Volume2, VolumeX, Phone, PhoneOff, MessageSquare, CheckCircle, XCircle, Clock, 
  Sparkles, Gauge, Trash2, CheckCircle2, User, Bot, RotateCcw, CreditCard, Smartphone,
  Calendar, RefreshCw, Percent, ShieldAlert, Split, FileText, Gift, Ban, ChevronRight,
  PackageCheck, UserCheck, AlertTriangle, UserPlus, FileSearch, Check
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
  verificationBadge?: string;
}

interface CustomerVerificationState {
  customerName: string;
  phone: string;
  orderId: string;
  item: string;
  amount: number;
  paymentRail: string;
  isVerified: boolean;
  cancelReason: string | null;
  retentionOfferMade: boolean;
  handoffToHuman: boolean;
}

interface QuickScenario {
  id: string;
  title: string;
  icon: any;
  color: string;
  intent: string;
  prompts: Record<string, string>;
  aiReplies: Record<string, string>;
  quickReplies: Record<string, string[]>;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { 
    code: 'en-IN', 
    name: 'English', 
    nativeName: 'English', 
    initialGreeting: 'Hello Rajesh! This is your Razorpay Assistant calling regarding your order #RZP-8921 for Apple AirPods Pro (₹4,650). Am I speaking with Rajesh Kumar?'
  },
  { 
    code: 'kn-IN', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    initialGreeting: 'ನಮಸ್ಕಾರ ರಾಜೇಶ್ ಅವರೇ! ನಾನು Razorpay ನಿಂದ ಪ್ರಿಯಾ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650) ಸಂಬಂಧಿಸಿದಂತೆ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ನೀವು ರಾಜೇಶ್ ಕುಮಾರ್ ಅವರೇನಾ?'
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिंदी', 
    initialGreeting: 'नमस्ते राजेश जी! मैं रेज़रपे से प्रिया बात कर रही हूँ, आपके आर्डर #RZP-8921 (Apple AirPods Pro - ₹4,650) के संबंध में। क्या मेरी बात राजेश कुमार जी से हो रही है?'
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    initialGreeting: 'வணக்கம் ராஜேஷ்! நான் Razorpay இலிருந்து பிரியா பேசுகிறேன். உங்கள் ஆர்டர் #RZP-8921 (₹4,650) குறித்து அழைக்கிறேன். நான் ராஜேஷ் குமாரிடம் பேசுகிறேனா?'
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    initialGreeting: 'నమస్కారం రాజేష్ గారు! నేను Razorpay నుండి ప్రియ మాట్లాడుతున్నాను. మీ ఆర్డర్ #RZP-8921 (₹4,650) గురించి కాల్ చేస్తున్నాను. నేను రాజేష్ కుమార్ గారితో మాట్లాడుతున్నానా?'
  },
  { 
    code: 'ml-IN', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    initialGreeting: 'നമസ്കാരം രാജേഷ്! ഞാൻ Razorpay-ൽ നിന്ന് പ്രിയ വിളിക്കുന്നു. നിങ്ങളുടെ ഓർഡർ #RZP-8921 (₹4,650) സംബന്ധിച്ചാണ് വിളിക്കുന്നത്. ഞാൻ രാജേഷ് കുമാറുമായിട്ടാണോ സംസാരിക്കുന്നത്?'
  }
];

const VERIFICATION_SCENARIOS: QuickScenario[] = [
  {
    id: 'verify_cancel',
    title: '1. Cancel Order Request',
    icon: Ban,
    color: 'text-rose-400 border-rose-900/40 bg-rose-950/30',
    intent: 'CANCEL_INSPECTION',
    prompts: {
      'English': 'I want to cancel this order immediately.',
      'Kannada': 'ದಯವಿಟ್ಟು ಈ ಆರ್ಡರ್ ಅನ್ನು ಈಗಲೇ ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ.',
      'Hindi': 'मुझे यह आर्डर तुरंत कैंसिल करना है।'
    },
    aiReplies: {
      'English': 'Before I process cancellation for Order #RZP-8921 (Apple AirPods Pro - ₹4,650), may I inspect why you would like to cancel: is it delivery time, finding a better price, or payment difficulty?',
      'Kannada': 'ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650) ರದ್ದು ಮಾಡುವ ಮುನ್ನ, ನೀವು ಏಕೆ ಕ್ಯಾನ್ಸಲ್ ಮಾಡುತ್ತಿದ್ದೀರಿ ಎಂದು ತಿಳಿಯಬಹುದೇ: ಡೆಲಿವರಿ ತಡವಾಗಿದೆಯೇ, ಅಥವಾ ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ?',
      'Hindi': 'आर्डर #RZP-8921 (Apple AirPods Pro - ₹4,650) कैंसिल करने से पहले, क्या मैं जान सकती हूँ कि कैंसिलेशन का क्या कारण है: डिलीवरी में देरी, या कीमत ज्यादा होना?'
    },
    quickReplies: {
      'English': ['Found Cheaper Elsewhere', 'Delivery Taking Too Long', 'Ordered by Mistake', 'Want Human Agent'],
      'Kannada': ['ಬೇರೆಡೆ ಕಡಿಮೆ ಬೆಲೆ ಇದೆ', 'ಡೆಲಿವರಿ ತಡವಾಗಿದೆ', 'ತಪ್ಪಾಗಿ ಆರ್ಡರ್ ಮಾಡಿದೆ', 'ಹಿರಿಯ ಮ್ಯಾನೇಜರ್‌ಗೆ ವರ್ಗಾಯಿಸಿ'],
      'Hindi': ['अन्य जगह सस्ता मिला', 'डिलीवरी में समय लग रहा है', 'गलती से आर्डर हुआ', 'ह्यूमन एजेंट से बात कराएं']
    }
  },
  {
    id: 'inspect_identity',
    title: '2. Identity & Order Audit',
    icon: UserCheck,
    color: 'text-blue-400 border-blue-900/40 bg-blue-950/30',
    intent: 'IDENTITY_AUDIT',
    prompts: {
      'English': 'Who is calling and which order details do you have on my account?',
      'Kannada': 'ಯಾರು ಕರೆ ಮಾಡುತ್ತಿರುವುದು ಮತ್ತು ನನ್ನ ಖಾತೆಯ ಯಾವ ಆರ್ಡರ್ ವಿವರಗಳಿವೆ?',
      'Hindi': 'आप कौन बात कर रहे हैं और मेरे किस आर्डर का विवरण आपके पास है?'
    },
    aiReplies: {
      'English': 'I have verified your account: Rajesh Kumar (+91 98450 XXXXX), Order #RZP-8921 for Apple AirPods Pro worth ₹4,650 placed today at 10:14 PM. Would you like me to inspect the pending payment status?',
      'Kannada': 'ಖಚಿತ ವಿವರಗಳು: ರಾಜೇಶ್ ಕುಮಾರ್ (+91 98450 XXXXX), ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650). ಬಾಕಿ ಇರುವ ಪಾವತಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಬೇಕೆ?',
      'Hindi': 'सत्यापित विवरण: राजेश कुमार (+91 98450 XXXXX), आर्डर #RZP-8921 (Apple AirPods Pro - ₹4,650)। क्या मैं पेमेंट स्टेटस की जांच करूँ?'
    },
    quickReplies: {
      'English': ['✓ Confirm My Identity', 'Verify Delivery Address', 'Inspect Payment Failure'],
      'Kannada': ['✓ ಗುರುತು ದೃಢೀಕರಿಸಿ', 'ಡೆಲಿವರಿ ವಿಳಾಸ ಪರಿಶೀಲಿಸಿ'],
      'Hindi': ['✓ मेरी पहचान सही है', 'डिलीवरी पता चेक करें']
    }
  },
  {
    id: 'human_escalate',
    title: '3. Escalate to Human',
    icon: UserPlus,
    color: 'text-amber-400 border-amber-900/40 bg-amber-950/30',
    intent: 'HUMAN_ESCALATION',
    prompts: {
      'English': 'I am not satisfied with automated AI. Connect me to a senior human manager.',
      'Kannada': 'ನನಗೆ AI ಜೊತೆ ಮಾತನಾಡಲು ಇಷ್ಟವಿಲ್ಲ. ಹಿರಿಯ ಮ್ಯಾನೇಜರ್‌ಗೆ ಕರೆ ವರ್ಗಾಯಿಸಿ.',
      'Hindi': 'मुझे किसी वरिष्ठ अधिकारी से बात करनी है, कॉल ट्रांसफर करें।'
    },
    aiReplies: {
      'English': 'Certainly Rajesh. I am compiling your full verified dossier (Order #RZP-8921, HDFC Card decline log, ₹4,650) and seamlessly transferring this live call to Senior Manager Vikram at Razorpay Desk right now.',
      'Kannada': 'ಖಂಡಿತ ರಾಜೇಶ್ ಅವರೇ. ನಿಮ್ಮ ಪೂರ್ಣ ಪರಿಶೀಲನಾ ವರದಿ (ಆರ್ಡರ್ #RZP-8921, ₹4,650) ಸಿದ್ಧಪಡಿಸಿ Razorpay ಹಿರಿಯ ಮ್ಯಾನೇಜರ್ ವಿಕ್ರಮ್ ಅವರಿಗೆ ಲೈವ್ ಕಾಲ್ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ.',
      'Hindi': 'जी बिल्कुल राजेश जी। आपका पूरा केस विवरण तैयार करके वरिष्ठ अधिकारी विक्रम जी को कॉल ट्रांसफर की जा रही है।'
    },
    quickReplies: {
      'English': ['✓ Transferring to Vikram (Razorpay)', 'Keep Me on Hold', 'Cancel Call'],
      'Kannada': ['✓ ವಿಕ್ರಮ್ ಅವರಿಗೆ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ', 'ಹೋಲ್ಡ್‌ನಲ್ಲಿರಿ'],
      'Hindi': ['✓ कॉल ट्रांसफर हो रही है', 'होल्ड पर रहें']
    }
  },
  {
    id: 'price_inspection',
    title: '4. Price & Discount Audit',
    icon: Percent,
    color: 'text-purple-400 border-purple-900/40 bg-purple-950/30',
    intent: 'PRICE_INSPECTION',
    prompts: {
      'English': 'The price ₹4,650 is too expensive. Can you offer a manager discount?',
      'Kannada': '₹4,650 ಬೆಲೆ ತುಂಬಾ ಹೆಚ್ಚಾಗಿದೆ. ಮ್ಯಾನೇಜರ್ ಡಿಸ್ಕೌಂಟ್ ನೀಡಲು ಸಾಧ್ಯವೇ?',
      'Hindi': '₹4,650 कीमत ज्यादा है। क्या कोई विशेष डिस्काउंट मिल सकता है?'
    },
    aiReplies: {
      'English': 'I have inspected our merchant authorization: I can apply an instant 5% goodwill retention coupon (SAVE232) reducing your cart to ₹4,418. Shall I issue this verified voucher to your WhatsApp?',
      'Kannada': 'ಪರಿಶೀಲನೆಯಂತೆ: ನಾನು ತಕ್ಷಣ 5% ರಿಯಾಯಿತಿ (SAVE232) ಅನ್ವಯಿಸಿ ಒಟ್ಟು ಮೊತ್ತವನ್ನು ₹4,418 ಗೆ ಇಳಿಸಬಹುದು. ಈ ಅಧಿಕೃತ ಕೂಪನ್ ಲಿಂಕ್ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಲೆ?',
      'Hindi': 'जांच के अनुसार: मैं तुरंत 5% डिस्काउंट कूपन लगाकर कीमत ₹4,418 कर सकती हूँ। क्या यह लिंक भेज दूँ?'
    },
    quickReplies: {
      'English': ['✓ Apply SAVE232 (₹4,418)', 'Need More Discount', 'Talk to Pricing Head'],
      'Kannada': ['✓ ₹4,418 ಗೆ ಕೂಪನ್ ಅನ್ವಯಿಸಿ', 'ಇನ್ನಷ್ಟು ರಿಯಾಯಿತಿ ಬೇಕು'],
      'Hindi': ['✓ ₹4,418 पर स्वीकारें', 'और डिस्काउंट चाहिए']
    }
  },
  {
    id: 'inspect_failure',
    title: '5. Deep Card Failure Diagnostic',
    icon: FileSearch,
    color: 'text-red-400 border-red-900/40 bg-red-950/30',
    intent: 'CARD_DIAGNOSTIC',
    prompts: {
      'English': 'Inspect why my HDFC Bank credit card was declined at 10:14 PM.',
      'Kannada': 'ರಾತ್ರಿ 10:14 ಕ್ಕೆ ನನ್ನ HDFC ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಏಕೆ ಫೇಲ್ ಆಯಿತು ಎಂದು ಪರಿಶೀಲಿಸಿ.',
      'Hindi': 'रात 10:14 बजे मेरा HDFC कार्ड क्यों रिजेक्ट हुआ, जांच करें।'
    },
    aiReplies: {
      'English': 'Audit Log: HDFC Gateway returned error code "E_504_GATEWAY_TIMEOUT". Your card has zero fraud blocks. Would you like to bypass HDFC gateway using 1-Tap UPI directly from WhatsApp?',
      'Kannada': 'ಆಡಿಟ್ ವರದಿ: HDFC ಗೇಟ್‌ವೇ "E_504_TIMEOUT" ದೋಷ ನೀಡಿದೆ. ನಿಮ್ಮ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಯಾವುದೇ ಬ್ಲಾಕ್ ಇಲ್ಲ. ವಾಟ್ಸಾಪ್ ಮೂಲಕ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಪಾವತಿಸಲು ಬಯಸುತ್ತೀರಾ?',
      'Hindi': 'ऑडिट रिपोर्ट: HDFC सर्वर टाइमआउट हुआ है, कार्ड में कोई रुकावट नहीं है। क्या 1-टैप यूपीआई से भुगतान करना चाहेंगे?'
    },
    quickReplies: {
      'English': ['📲 Send 1-Tap UPI Route', 'Retry HDFC Card Now', 'Escalate to Bank Desk'],
      'Kannada': ['📲 ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಿ', 'ಮತ್ತೊಮ್ಮೆ ಕಾರ್ಡ್ ಪ್ರಯತ್ನಿಸಿ'],
      'Hindi': ['📲 1-टैप यूपीआई लिंक लें', 'दोबारा कार्ड ट्राय करें']
    }
  },
  {
    id: 'verify_refund',
    title: '6. Double-Debit Audit & T+0 Refund',
    icon: RefreshCw,
    color: 'text-emerald-400 border-emerald-900/40 bg-emerald-950/30',
    intent: 'REFUND_INSPECTION',
    prompts: {
      'English': 'Money was debited from my account. Show me the UTR and refund proof.',
      'Kannada': 'ನನ್ನ ಖಾತೆಯಿಂದ ಹಣ ಕಟ್ ಆಗಿದೆ. UTR ಸಂಖ್ಯೆ ಮತ್ತು ರಿಫಂಡ್ ದಾಖಲೆ ತೋರಿಸಿ.',
      'Hindi': 'पैसे कट गए हैं, मुझे UTR और रिफंड का प्रमाण दीजिए।'
    },
    aiReplies: {
      'English': 'Audit Verified: NPCI UTR #904288192014 confirms ₹4,650 reversal executed via Razorpay T+0 instant rail. Money credited to rajesh@okhdfcbank in 2.18s. Confirmation PDF sent to WhatsApp.',
      'Kannada': 'ದೃಢೀಕೃತ ವರದಿ: NPCI UTR #904288192014 ಮೂಲಕ ₹4,650 ಹಣವನ್ನು 2.18 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರಿಫಂಡ್ ಮಾಡಲಾಗಿದೆ. ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ರಶೀದಿ ಪರಿಶೀಲಿಸಿ.',
      'Hindi': 'सत्यापित: NPCI UTR #904288192014 के तहत ₹4,650 का रिफंड 2.18 सेकंड में जमा हो चुका है। रसीद व्हाट्सएप पर भेजी गई है।'
    },
    quickReplies: {
      'English': ['✓ View NPCI UTR Certificate', 'Re-order AirPods Pro', 'Done, Thank You'],
      'Kannada': ['✓ UTR ಪ್ರಮಾಣಪತ್ರ ವೀಕ್ಷಿಸಿ', 'ಮರು ಆರ್ಡರ್ ಮಾಡಿ'],
      'Hindi': ['✓ UTR सर्टिफिकेट देखें', 'दोबारा आर्डर करें']
    }
  },
  {
    id: 'split_inspect',
    title: '7. Verified 50% Split Payment',
    icon: Split,
    color: 'text-indigo-400 border-indigo-900/40 bg-indigo-950/30',
    intent: 'SPLIT_INSPECTION',
    prompts: {
      'English': 'Can I split this ₹4,650 into two parts and verify the terms?',
      'Kannada': 'ಈ ₹4,650 ಮೊತ್ತವನ್ನು ಎರಡು ಭಾಗವಾಗಿ ಕಟ್ಟಿ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದೇ?',
      'Hindi': 'क्या ₹4,650 को दो किस्तों में बांटकर शर्तें जांची जा सकती हैं?'
    },
    aiReplies: {
      'English': 'Verification Approved: Part 1 of ₹2,325 payable now via UPI to secure order dispatch; Part 2 of ₹2,325 scheduled for next Monday with zero interest. Shall I generate this official split contract?',
      'Kannada': 'ಅನುಮೋದನೆ ದೊರೆತಿದೆ: ಭಾಗ 1 (₹2,325) ಈಗ ಪಾವತಿಸಿ ಆರ್ಡರ್ ಕಳುಹಿಸಲಾಗುತ್ತದೆ; ಭಾಗ 2 (₹2,325) ಮುಂದಿನ ಸೋಮವಾರ ಪಾವತಿಸಬಹುದು (0% ಬಡ್ಡಿ). ಒಪ್ಪಿಗೆಯೇ?',
      'Hindi': 'सत्यापन स्वीकृत: पहली किस्त ₹2,325 अभी दें और आर्डर डिस्पैच कराएं; दूसरी किस्त ₹2,325 अगले सोमवार (0% ब्याज)। क्या लिंक भेजें?'
    },
    quickReplies: {
      'English': ['✓ Approve ₹2,325 Split Link', 'Check 3-Month No-Cost EMI', 'Decline Split'],
      'Kannada': ['✓ ₹2,325 ಸ್ಪ್ಲಿಟ್ ಲಿಂಕ್ ಕಳುಹಿಸಿ', '3 ತಿಂಗಳ EMI ಪರಿಶೀಲಿಸಿ'],
      'Hindi': ['✓ ₹2,325 की पहली किस्त दें', 'नो-कॉस्ट EMI देखें']
    }
  },
  {
    id: 'fraud_audit',
    title: '8. Security & Fraud Protection',
    icon: ShieldAlert,
    color: 'text-cyan-400 border-cyan-900/40 bg-cyan-950/30',
    intent: 'FRAUD_AUDIT',
    prompts: {
      'English': 'How do I know this is a genuine Razorpay telecaller and not a phishing call?',
      'Kannada': 'ಇದು ಅಸಲಿ Razorpay ಕರೆ ಎಂದು ನನಗೆ ಹೇಗೆ ತಿಳಿಯುತ್ತದೆ, ಇದು ವಂಚನೆಯಲ್ಲವೇ?',
      'Hindi': 'मुझे कैसे यकीन हो कि यह असली रेज़रपे की कॉल है और कोई फ्रॉड नहीं?'
    },
    aiReplies: {
      'English': 'Security Verification: All links come strictly from verified green-badged Razorpay WhatsApp (rzp.io/i/RR-9042). We NEVER ask for PIN, OTP, or CVV. Shall I send an official verification badge to your device?',
      'Kannada': 'ಸುರಕ್ಷತಾ ದೃಢೀಕರಣ: ಎಲ್ಲಾ ಲಿಂಕ್‌ಗಳು Razorpay ಅಧಿಕೃತ ಗ್ರೀನ್-ಟಿಕ್ ವಾಟ್ಸಾಪ್ (rzp.io/i/RR-9042) ಮೂಲಕ ಮಾತ್ರ ಬರುತ್ತವೆ. ನಾವು ಯಾವುದೇ PIN ಅಥವಾ OTP ಕೇಳುವುದಿಲ್ಲ.',
      'Hindi': 'सुरक्षा प्रमाण: सभी लिंक केवल रेज़रपे के वेरिफाइड ग्रीन-टिक व्हाट्सएप (rzp.io/i/RR-9042) से आते हैं। हम कभी OTP या PIN नहीं मांगते।'
    },
    quickReplies: {
      'English': ['✓ Receive Official Badge SMS', 'Verify Merchant GSTIN', 'Report Suspicious'],
      'Kannada': ['✓ ಅಧಿಕೃತ SMS ಪರಿಶೀಲನೆ ಪಡೆಯಿರಿ', 'ಕಂಪನಿ GST ಪರಿಶೀಲಿಸಿ'],
      'Hindi': ['✓ आधिकारिक SMS प्राप्त करें', 'GST नंबर देखें']
    }
  },
  {
    id: 'gst_audit',
    title: '9. Business GSTIN Tax Invoice',
    icon: FileText,
    color: 'text-teal-400 border-teal-900/40 bg-teal-950/30',
    intent: 'GST_AUDIT',
    prompts: {
      'English': 'I need to inspect the GST calculation for 18% Input Tax Credit.',
      'Kannada': '18% ಇನ್‌ಪುಟ್ ಟ್ಯಾಕ್ಸ್ ಕ್ರೆಡಿಟ್‌ಗಾಗಿ GST ಲೆಕ್ಕಾಚಾರವನ್ನು ಪರಿಶೀಲಿಸಬೇಕು.',
      'Hindi': 'मुझे 18% इनपुट टैक्स क्रेडिट के लिए GST बिल की जांच करनी है।'
    },
    aiReplies: {
      'English': 'GST Breakdown for Order #RZP-8921: Base Price ₹3,940.68 + 18% IGST (₹709.32) = Total ₹4,650. Enter your 15-digit GSTIN to receive an automatic B2B tax invoice.',
      'Kannada': 'GST ವಿವರ: ಮೂಲ ಬೆಲೆ ₹3,940.68 + 18% IGST (₹709.32) = ಒಟ್ಟು ₹4,650. ನಿಮ್ಮ 15-ಅಂಕಿಯ GSTIN ನೀಡಿದರೆ ಅಧಿಕೃತ ಇನ್‌ವಾಯ್ಸ್ ನೀಡಲಾಗುವುದು.',
      'Hindi': 'GST विवरण: मूल मूल्य ₹3,940.68 + 18% IGST (₹709.32) = कुल ₹4,650। कृपया अपना 15 अंकों का GSTIN दर्ज करें।'
    },
    quickReplies: {
      'English': ['✓ Enter Company GSTIN', 'Download Estimate Bill', 'Send to Accounts Team'],
      'Kannada': ['✓ GSTIN ಸಂಖ್ಯೆ ನಮೂದಿಸಿ', 'ಎಸ್ಟಿಮೇಟ್ ಬಿಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ'],
      'Hindi': ['✓ GSTIN नंबर दर्ज करें', 'बिल ईमेल करें']
    }
  },
  {
    id: 'store_boost',
    title: '10. Instant ₹4,882 Goodwill Credit',
    icon: Gift,
    color: 'text-pink-400 border-pink-900/40 bg-pink-950/30',
    intent: 'STORE_BOOST',
    prompts: {
      'English': 'Inspect the store credit boost with 5% bonus voucher.',
      'Kannada': '5% ಬೋನಸ್ ವೋಚರ್‌ನೊಂದಿಗೆ ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      'Hindi': '5% अतिरिक्त बोनस वाले स्टोर वाउचर का विवरण दिखाएं।'
    },
    aiReplies: {
      'English': 'Retention Audit: Instead of waiting 5 bank days, we can issue an instant merchant credit of ₹4,882 (₹4,650 + ₹232 bonus perk) active immediately. Shall I credit this to your verified profile?',
      'Kannada': 'ವಿಶೇಷ ಕೊಡುಗೆ: ಬ್ಯಾಂಕ್ ತಡವಿಲ್ಲದೆ ತಕ್ಷಣ ₹4,882 ಮೌಲ್ಯದ (₹4,650 + ₹232 ಬೋನಸ್) ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ ವೋಚರ್ ನೀಡಲಾಗುತ್ತಿದೆ. ಒಪ್ಪಿಗೆಯೇ?',
      'Hindi': 'विशेष वाउचर: बैंक में प्रतीक्षा किए बिना तुरंत ₹4,882 (₹4,650 + ₹232 बोनस) का वॉलेट बैलेंस प्राप्त करें। क्या जारी करें?'
    },
    quickReplies: {
      'English': ['✓ Claim ₹4,882 Credit Instantly', 'Prefer UPI Cash', 'Ask Manager'],
      'Kannada': ['✓ ₹4,882 ಕ್ರೆಡಿಟ್ ತಕ್ಷಣ ಪಡೆಯಿರಿ', 'ಯುಪಿಐ ಹಣವೇ ಬೇಕು'],
      'Hindi': ['✓ ₹4,882 क्रेडिट तुरंत लें', 'कैश रिफंड चाहिए']
    }
  }
];

export default function VoiceRecovery() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [callState, setCallState] = useState<'IDLE' | 'LISTENING' | 'ANALYZING' | 'AI_SPEAKING'>('IDLE');
  const [callDuration, setCallDuration] = useState(12);
  const [currentSpokenText, setCurrentSpokenText] = useState("");
  const [customText, setCustomText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const [customerDossier, setCustomerDossier] = useState<CustomerVerificationState>({
    customerName: "Rajesh Kumar",
    phone: "+91 98450 XXXXX",
    orderId: "RZP-8921",
    item: "Apple AirPods Pro",
    amount: 4650,
    paymentRail: "HDFC Card (Timeout: E_504)",
    isVerified: true,
    cancelReason: null,
    retentionOfferMade: false,
    handoffToHuman: false
  });

  const [conversationHistory, setConversationHistory] = useState<MessageTurn[]>([
    {
      id: "msg-0",
      role: "agent",
      text: SUPPORTED_LANGUAGES[0].initialGreeting,
      timestamp: "00:02",
      lang: "English",
      verificationBadge: "VERIFIED_DOSSIER",
      quickReplies: ["✓ Yes, Speaking", "No, Wrong Number", "Why are you calling?"]
    }
  ]);
  
  const [parsedIntent, setParsedIntent] = useState<any>({
    intent: "DOSSIER_VERIFIED",
    language: "English",
    sentiment: "Attentive / Inquiring",
    confidence: 99,
    willingness: "Pending Inspection",
    method: "HDFC Card / UPI Intent",
    date: "Immediate",
    action: "Inspecting order parameters & authenticating customer intention"
  });

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLang(lang);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setCallState('IDLE');
    setCurrentSpokenText("");
    setShowWhatsAppPopup(false);

    setConversationHistory([
      {
        id: `msg-${Date.now()}`,
        role: 'agent',
        text: lang.initialGreeting,
        timestamp: formatCallTime(callDuration),
        lang: lang.name,
        verificationBadge: "VERIFIED_DOSSIER",
        quickReplies: ["✓ Yes, Speaking", "No, Wrong Number", "Why are you calling?"]
      }
    ]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, callState]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

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
    
    processInspectTurn(textToProcess, updatedHistory);
  };

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

    processInspectTurn(textToSubmit, updatedHistory);
  };

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

    const isHumanHandoff = scenario.intent === 'HUMAN_ESCALATION';
    const isCancellation = scenario.intent === 'CANCEL_INSPECTION';

    if (isHumanHandoff) {
      setCustomerDossier(prev => ({ ...prev, handoffToHuman: true }));
    }

    const agentMsg: MessageTurn = {
      id: `agent-${Date.now() + 1}`,
      role: 'agent',
      text: aiReplyText,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name,
      intent: scenario.intent,
      quickReplies: chips,
      verificationBadge: isHumanHandoff ? "TRANSFERRED_TO_HUMAN_VIKRAM" : "INSPECTED_&_VERIFIED"
    };

    setConversationHistory(prev => [...prev, customerMsg, agentMsg]);

    setParsedIntent({
      intent: scenario.intent,
      language: selectedLang.name,
      sentiment: isHumanHandoff ? "Escalated to Human" : isCancellation ? "Inspecting Cancellation Grounds" : "Positive (Inspected)",
      confidence: 99,
      willingness: isHumanHandoff ? "Human Attention Required" : "Rigorous Verification",
      method: "Verified Razorpay Rail",
      date: "Immediate",
      action: isHumanHandoff 
        ? "Transferred to Senior Recovery Manager Vikram at Razorpay Desk" 
        : `Inspecting Order #${customerDossier.orderId} for ${customerDossier.customerName}`
    });

    if (!isCancellation && !isHumanHandoff && scenario.intent !== 'REFUND_INSPECTION') {
      setShowWhatsAppPopup(true);
    } else {
      setShowWhatsAppPopup(false);
    }

    speakAIResponse(aiReplyText, selectedLang.code, () => {
      setCallState('IDLE');
    });
  };

  const processInspectTurn = async (text: string, currentHistory: MessageTurn[]) => {
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
        console.warn("Backend offline, using local verification engine.");
      }

      // Exact Progressive Fallback Engine
      if (!intentData || intentData.intent === "UNKNOWN" || !intentData.intent) {
        const t = text.toLowerCase().trim();

        // 1. Human Escalation
        if (/\b(human|manager|senior|officer|talk to person|person|ವಿಕ್ರಮ್|ಮ್ಯಾನೇಜರ್|इंसान|अधिकारी)\b/i.test(t)) {
          setCustomerDossier(prev => ({ ...prev, handoffToHuman: true }));
          intentData = {
            intent: "HUMAN_ESCALATION",
            sentiment: "Human Attention Required",
            confidence_score: 99,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಖಂಡಿತ ರಾಜೇಶ್ ಅವರೇ. ನಿಮ್ಮ ಆರ್ಡರ್ ವಿವರಗಳನ್ನು (Apple AirPods Pro - ₹4,650) ಹಿರಿಯ ಮ್ಯಾನೇಜರ್ ವಿಕ್ರಮ್ ಅವರಿಗೆ ಲೈವ್ ಕಾಲ್ ಮೂಲಕ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು 5 ಸೆಕೆಂಡುಗಳು ಹೋಲ್ಡ್‌ನಲ್ಲಿರಿ."
              : "Certainly Rajesh. I am transferring your verified case (Order #RZP-8921, ₹4,650) directly to Senior Manager Vikram at the Razorpay Desk. Please hold for 5 seconds.",
            recommended_action: "Live human call handoff executed to Senior Specialist Vikram",
            quick_replies: ['✓ Connected with Vikram', 'Cancel Transfer']
          };
        }
        // 2. SMS Delivery Request
        else if (/\b(sms|text message|send sms|ಮೆಸೇಜ್|ಎಸ್ಎಂಎಸ್|एसएमएस)\b/i.test(t)) {
          intentData = {
            intent: "SMS_DISPATCHED",
            sentiment: "Positive (Channel Switch)",
            confidence_score: 99,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಖಂಡಿತ! ಪಾವತಿ ಲಿಂಕ್ ಹೊಂದಿರುವ SMS ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ +91 98450 XXXXX ಗೆ ರವಾನಿಸಲಾಗಿದೆ. ನೀವು Google Pay ಅಥವಾ PhonePe ಮೂಲಕ ಪಾವತಿಸಲು ಬಯಸುತ್ತೀರಾ?"
              : "Done! A secure SMS with your 1-Tap payment link has been dispatched to +91 98450 XXXXX. Would you prefer completing it via Google Pay or PhonePe?",
            recommended_action: "Dispatched verified SMS payment deep link to customer mobile",
            quick_replies: ['Google Pay', 'PhonePe', 'Paytm UPI', 'Check Delivery Status']
          };
        }
        // 3. WhatsApp / Switch to UPI
        else if (/\b(whatsapp|switch to upi|upi|gpay|google pay|phonepe|paytm|ವಾಟ್ಸಾಪ್|ಯುಪಿಐ|ಜಿಪೇ|ಫೋನ್‌ಪೇ|व्हाट्सएप|यूपीआई)\b/i.test(t)) {
          intentData = {
            intent: "UPI_SELECTION",
            sentiment: "Positive (Prefers UPI)",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಅಧಿಕೃತ Razorpay 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀವು Google Pay, PhonePe ಅಥವಾ Paytm ಮೂಲಕ ತಕ್ಷಣ ಪೂರ್ಣಗೊಳಿಸಬಹುದೇ?"
              : "Your verified 1-Tap UPI link is now active in WhatsApp. Would you like to complete payment using Google Pay, PhonePe, or Paytm?",
            recommended_action: "Awaiting customer app selection to complete 1-tap checkout",
            quick_replies: ['✓ Paid via Google Pay', '✓ Paid via PhonePe', 'Need Split Payment', 'Talk to Manager']
          };
        }
        // 4. Card Decline / Timeout
        else if (/\b(card|verify card|bank|retry|timeout|ಕಾರ್ಡ್|ಬ್ಯಾಂಕ್|कार्ड)\b/i.test(t)) {
          intentData = {
            intent: "CARD_DIAGNOSTIC",
            sentiment: "Technical Complaint",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಆಡಿಟ್ ವರದಿ: HDFC ಗೇಟ್‌ವೇ E_504 ದೋಷ ನೀಡಿದೆ. ನಿಮ್ಮ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಯಾವುದೇ ದೋಷವಿಲ್ಲ. 10 ನಿಮಿಷದಲ್ಲಿ ಮರುಪ್ರಯತ್ನಿಸುತ್ತೀರಾ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಯುಪಿಐ ಬಳಸುತ್ತೀರಾ?"
              : "Audit Log: HDFC Gateway timed out (E_504). Your card is perfectly active with zero fraud flags. Would you like to retry in 10 minutes or use 1-Tap UPI?",
            recommended_action: "Provided live bank downtime diagnostic",
            quick_replies: ['Switch to UPI', 'Retry Card Now', 'Escalate to Human']
          };
        }
        // 5. Cancellation Request
        else if (/\b(cancel|dont want|don't want|stop|not interested|ಕ್ಯಾನ್ಸಲ್|ಬೇಡ|रद्द)\b/i.test(t)) {
          intentData = {
            intent: "CANCEL_INSPECTION",
            sentiment: "Inspecting Cancellation",
            confidence_score: 98,
            willingness_to_pay: false,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಆರ್ಡರ್ #RZP-8921 (₹4,650) ರದ್ದು ಮಾಡುವ ಮುನ್ನ, ನೀವು ಏಕೆ ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲು ಬಯಸುತ್ತಿದ್ದೀರಿ ಎಂದು ತಿಳಿಸಬಹುದೇ: ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ ಅಥವಾ ಡೆಲಿವರಿ ತಡವಾಗಿದೆಯೇ?"
              : "Before I authorize cancellation for Order #RZP-8921 (₹4,650), may I inspect why: is it delivery time, high price, or would you like to speak with a human manager?",
            recommended_action: "Inspecting cancellation grounds & assessing retention options",
            quick_replies: ['Found Cheaper', 'Delivery Too Slow', 'Talk to Human Manager', 'Confirm Final Cancel']
          };
        }
        // 6. Price Objection
        else if (/\b(cheaper|expensive|price|discount|ದುಬಾರಿ|ಕಡಿಮೆ|महंगा|सस्ता)\b/i.test(t)) {
          intentData = {
            intent: "PRICE_RETENTION",
            sentiment: "Price Objection Inspected",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಖಂಡಿತ! ನಾನು ನಿಮ್ಮ ಆರ್ಡರ್‌ಗೆ ₹232 ಮ್ಯಾನೇಜರ್ ಡಿಸ್ಕೌಂಟ್ (SAVE232) ಅನ್ವಯಿಸಿ ₹4,418 ಗೆ ಇಳಿಸಬಹುದು. ಈ ರಿಯಾಯಿತಿ ಲಿಂಕ್ ಕಳುಹಿಸಲೆ?"
              : "I understand! I can apply an official 5% retention discount (SAVE232) reducing your price from ₹4,650 to ₹4,418. Shall I send this verified link?",
            recommended_action: "Applied dynamic 5% retention incentive",
            quick_replies: ['✓ Accept ₹4,418 Offer', 'Still Want to Cancel', 'Talk to Manager']
          };
        }
        // 7. Initial Confirmation / Yes
        else if (/\b(yes|speaking|correct|right|ಹೌದು|ಸರಿ|हाँ)\b/i.test(t)) {
          intentData = {
            intent: "IDENTITY_CONFIRMED",
            sentiment: "Positive / Verified",
            confidence_score: 99,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಧನ್ಯವಾದಗಳು ರಾಜೇಶ್ ಅವರೇ! ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 (₹4,650) ಗಾಗಿ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಪಾವತಿ ಲಿಂಕ್ ಅನ್ನು ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ನೀವು SMS ಮೂಲಕವೂ ಲಿಂಕ್ ಪಡೆಯಲು ಬಯಸುತ್ತೀರಾ?"
              : "Thank you Rajesh! Order #RZP-8921 parameters verified. The official 1-Tap UPI payment link has been delivered to your WhatsApp (+91 98450 XXXXX). Would you also like an SMS copy?",
            recommended_action: "Delivered authenticated 1-Tap UPI deep link",
            quick_replies: ['✓ Open WhatsApp Link', 'Send SMS Copy', 'Switch to UPI', 'Verify Card Details']
          };
        }
        // 8. Payment Completed / Done
        else if (/\b(done|paid|completed|ಪಾವತಿಸಿದೆ|ಮಾಡಿದೆ|हो गया)\b/i.test(t)) {
          intentData = {
            intent: "PAYMENT_CONFIRMED",
            sentiment: "Positive / Completed",
            confidence_score: 99,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ₹4,650 ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ. ಆರ್ಡರ್ #RZP-8921 ತಕ್ಷಣ ರವಾನೆಯಾಗಲಿದೆ. ರಶೀದಿ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿದೆ."
              : "Thank you Rajesh! Your payment of ₹4,650 has been confirmed. Order #RZP-8921 is now approved for immediate dispatch.",
            recommended_action: "Payment confirmed, invoice generated",
            quick_replies: ['Download Invoice', 'Track Delivery']
          };
        }
        // General query
        else {
          intentData = {
            intent: "INSPECTION_QUERY",
            sentiment: "Attentive",
            confidence_score: 96,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಖಂಡಿತ, ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650) ಸಂಬಂಧಿಸಿದಂತೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
              : "I am inspecting that for you right now regarding Order #RZP-8921 (Apple AirPods Pro - ₹4,650). How would you prefer to proceed?",
            recommended_action: "Inspected account details and awaiting customer preference",
            quick_replies: ['Switch to UPI', 'Send SMS Copy', 'Transfer to Human']
          };
        }
      }

      const aiReplyText = intentData.ai_spoken_reply;
      const isHumanHandoff = intentData.intent === 'HUMAN_ESCALATION';
      const isCancellation = intentData.intent === 'CANCEL_INSPECTION';

      setParsedIntent({
        intent: intentData.intent || "INSPECTION_QUERY",
        language: selectedLang.name,
        sentiment: intentData.sentiment || "Attentive",
        confidence: intentData.confidence_score || 98,
        willingness: isHumanHandoff ? "Transferred to Human" : "Rigorous Verification",
        method: isCancellation ? "None" : "Verified UPI / Card",
        date: "Immediate",
        action: intentData.recommended_action || "Account inspected and authenticated"
      });

      if (!isCancellation && !isHumanHandoff) {
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
        intent: intentData.intent,
        quickReplies: intentData.quick_replies,
        verificationBadge: isHumanHandoff ? "TRANSFERRED_TO_HUMAN_VIKRAM" : "INSPECTED_&_VERIFIED"
      };

      setConversationHistory(prev => [...prev, agentMsg]);

      speakAIResponse(aiReplyText, selectedLang.code, () => {
        setCallState('IDLE');
      });

    } catch (err) {
      console.error("Inspection processing error:", err);
      setCallState('IDLE');
    }
  };

  const clearCallHistory = () => {
    setCustomerDossier(prev => ({ ...prev, handoffToHuman: false, cancelReason: null }));
    setConversationHistory([{
      id: `msg-${Date.now()}`,
      role: 'agent',
      text: selectedLang.initialGreeting,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name,
      verificationBadge: "VERIFIED_DOSSIER",
      quickReplies: ["✓ Yes, Speaking", "No, Wrong Number", "Why are you calling?"]
    }]);
    setShowWhatsAppPopup(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6 md:p-10 font-sans">
      
      {/* Top Header */}
      <header className="mb-5 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Phone className="mr-2.5 text-blue-500" size={24} />
              Human-Grade Verified Telecaller & Recovery Agent
            </h1>
            <span className="flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              Live Telecall: {formatCallTime(callDuration)}
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            Zero blind assumptions. The AI inspects order ID, item name, amount, checks motives, and seamlessly escalates to humans when needed.
          </p>
        </div>

        {/* Audio Toggle & Language Bar */}
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

      {/* Verified Customer Order Dossier Bar */}
      <section className="max-w-6xl mx-auto mb-5 bg-slate-900/90 border border-blue-900/50 rounded-2xl p-3.5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{customerDossier.customerName}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono">
                  ✓ Authenticated Account
                </span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">{customerDossier.phone}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>

          {/* Inspected Order Details */}
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-gray-400 text-[10px] uppercase block">Order ID</span>
              <span className="font-mono font-bold text-blue-400 text-xs">#{customerDossier.orderId}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase block">Product Item</span>
              <span className="font-semibold text-white text-xs">{customerDossier.item}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase block">Amount</span>
              <span className="font-bold text-emerald-400 text-xs">₹{customerDossier.amount}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase block">Last Gateway Log</span>
              <span className="text-red-400 font-mono text-[11px]">{customerDossier.paymentRail}</span>
            </div>
          </div>

          {/* Human Escalation Badge */}
          {customerDossier.handoffToHuman && (
            <div className="flex items-center bg-amber-950/80 border border-amber-800 text-amber-300 px-3 py-1.5 rounded-xl font-semibold text-xs animate-pulse">
              <UserPlus size={14} className="mr-1.5" />
              Connected: Senior Specialist Vikram
            </div>
          )}

        </div>
      </section>

      {/* 10 Interactive Inspection Scenario Buttons */}
      <section className="max-w-6xl mx-auto mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
            <Sparkles size={12} className="mr-1.5 text-yellow-400" />
            10 Rigorous Telecaller Inspection Inquiries (Click to Test AI Vigilance):
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">No Blind Assumptions • Full Verification</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {VERIFICATION_SCENARIOS.map((sc) => {
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

      {/* Main 2-Column Telecaller Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        
        {/* Left 7 Columns: Live Call Thread */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-gray-800 flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
          
          {/* Active Call Header */}
          <div className="p-3.5 bg-slate-950/80 border-b border-gray-800 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-semibold text-white">Telecaller Desk: Razorpay Assistant ➔ Rajesh Kumar</span>
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

                    <div className={`max-w-[84%] rounded-2xl p-3 shadow-md ${
                      isCustomer 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-900 border border-gray-800 text-gray-200 rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 gap-2">
                        <span className="font-bold">{isCustomer ? `Customer (${msg.lang})` : 'Razorpay Assistant'}</span>
                        <div className="flex items-center space-x-1.5 font-mono">
                          {msg.verificationBadge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                              ✓ {msg.verificationBadge}
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                      <p className="leading-relaxed text-[13px]">{msg.text}</p>
                    </div>

                    {isCustomer && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-gray-700 text-gray-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        <User size={14} />
                      </div>
                    )}
                  </div>

                  {/* Interactive Quick-Reply Action Chips */}
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

            {/* Live Streaming Speech Buffer */}
            {callState === 'LISTENING' && currentSpokenText && (
              <div className="flex justify-end items-start space-x-2 animate-fade-in">
                <div className="max-w-[84%] rounded-2xl p-3 bg-blue-950/60 border border-blue-500/50 text-blue-200 rounded-br-none">
                  <div className="flex items-center space-x-1.5 text-[10px] text-blue-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-bold">Speaking in real-time...</span>
                  </div>
                  <p className="italic text-[13px]">{currentSpokenText}</p>
                </div>
              </div>
            )}

            {/* Thinking / Inspecting Indicator */}
            {callState === 'ANALYZING' && (
              <div className="flex items-center space-x-2 text-blue-400 p-2 text-xs animate-pulse">
                <Activity size={16} className="animate-spin" />
                <span>Razorpay Assistant inspecting dialogue & updating recovery state...</span>
              </div>
            )}

            {/* AI Speaking Wave */}
            {callState === 'AI_SPEAKING' && (
              <div className="flex items-center space-x-2 text-emerald-400 p-2 text-xs">
                <Volume2 size={16} className="animate-bounce" />
                <span>Razorpay Assistant speaking in {selectedLang.name}...</span>
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
                  TAP TO TALK WITH RAZORPAY ASSISTANT ({selectedLang.name})
                </button>
              )}
            </div>

            {/* Custom Text Typing Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleTurnSubmit(customText); }} className="mt-3 flex space-x-2">
              <input 
                type="text" 
                placeholder={`Speak or type your answer to Razorpay Assistant in ${selectedLang.name}...`}
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

        {/* Right 5 Columns: Inspection & Audit State */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Structured Intelligence Card */}
          <div className="bg-slate-900 rounded-2xl border border-gray-800 p-5 shadow-2xl relative min-h-[290px]">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h2 className="font-bold text-white text-sm flex items-center">
                <Zap size={16} className="mr-2 text-yellow-400" />
                Telecaller Verification Audit
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono flex items-center">
                <Gauge size={10} className="mr-1" />
                {parsedIntent?.confidence || 99}% Verified
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Inspection Intent</dt>
                <dd className="font-bold text-white">{parsedIntent?.intent || "DOSSIER_VERIFIED"}</dd>
              </div>

              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Dialect Active</dt>
                <dd className="font-bold text-blue-400">{selectedLang.name}</dd>
              </div>

              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Customer Sentiment</dt>
                <dd className="font-bold text-emerald-400">{parsedIntent?.sentiment || "Attentive"}</dd>
              </div>

              <div className="bg-black/60 p-2.5 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-0.5 text-[11px]">Target Order</dt>
                <dd className="font-bold text-purple-400">#RZP-8921 (₹4,650)</dd>
              </div>
            </dl>

            <div className="mt-3.5 bg-blue-950/40 border border-blue-900/60 p-3 rounded-xl text-xs">
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-1 flex items-center">
                <Sparkles size={11} className="mr-1" />
                Vigilant Telecaller Assessment
              </p>
              <p className="text-xs font-medium text-white flex items-center">
                <ArrowRight size={13} className="mr-1.5 text-blue-400 shrink-0" />
                {parsedIntent?.action || "Inspecting order parameters & authenticating customer intention"}
              </p>
            </div>

          </div>

          {/* Human Escalation Card */}
          {customerDossier.handoffToHuman && (
            <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 shadow-xl text-xs space-y-2 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <UserPlus size={16} />
                <span>Live Escalation: Senior Specialist Vikram</span>
              </div>
              <p className="text-gray-300 text-[11px]">
                The AI felt human discretion was necessary for Order #RZP-8921. Customer dossier and call transcript were handed off in real-time to senior management.
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
                <span className="text-[10px] text-emerald-400 font-mono">Verified ✓</span>
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
