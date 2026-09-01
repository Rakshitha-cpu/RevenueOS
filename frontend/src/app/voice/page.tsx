'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Mic, MicOff, Languages, Send, Phone, RotateCcw, Smartphone,
  Sparkles, ShieldCheck, ChevronRight, Ban, RefreshCw, UserPlus, ShieldAlert, CheckCircle2,
  Package, ShoppingCart, Tag, AlertCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  getGreeting: (product: string, price: number, orderId: string) => string;
  quickReplies: string[];
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

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { 
    code: 'en-IN', 
    name: 'English', 
    nativeName: 'English', 
    getGreeting: (prod, price, id) => `Hello Rajesh! This is your Razorpay Assistant calling regarding Order #${id} (₹${price.toLocaleString()} - ${prod}). Am I speaking with Rajesh Kumar?`,
    quickReplies: ['Yes, speaking.', 'Who is this?', 'Wrong Number', 'Why are you calling?']
  },
  { 
    code: 'kn-IN', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    getGreeting: (prod, price, id) => `ನಮಸ್ಕಾರ ರಾಜೇಶ್! ನಾನು ನಿಮ್ಮ Razorpay Assistant ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಆರ್ಡರ್ #${id} (${prod} - ₹${price.toLocaleString()}) ಕುರಿತು ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ನಾನು ರಾಜೇಶ್ ಅವರೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಿದ್ದೇನಾ?`,
    quickReplies: ['ಹೌದು, ನಾನೇ', 'ಯಾರು ನೀವು?', 'ತಪ್ಪು ಸಂಖ್ಯೆ', 'ಯಾಕೆ ಕರೆ ಮಾಡಿದ್ದೀರಿ?']
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिंदी', 
    getGreeting: (prod, price, id) => `नमस्ते राजेश! मैं आपका Razorpay Assistant बोल रहा हूँ। आपके Order #${id} (${prod} - ₹${price.toLocaleString()}) के बारे में call कर रहा हूँ। क्या मैं Rajesh Kumar से बात कर रहा हूँ?`,
    quickReplies: ['हाँ, बोल रहा हूँ', 'आप कौन हैं?', 'गलत नंबर', 'कॉल क्यों किया?']
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    getGreeting: (prod, price, id) => `வணக்கம் ராஜேஷ்! நான் உங்கள் Razorpay Assistant பேசுகிறேன். உங்கள் ஆர்டர் #${id} (${prod} - ₹${price.toLocaleString()}) குறித்து அழைக்கிறேன். நான் ராஜேஷ் குமாரிடம் பேசுகிறேனா?`,
    quickReplies: ['ஆமாம், நான்தான்', 'யார் நீங்கள்?', 'தவறான எண்', 'ஏன் அழைத்தீர்கள்?']
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    getGreeting: (prod, price, id) => `నమస్కారం రాజేష్! నేను మీ Razorpay Assistant మాట్లాడుతున్నాను. మీ ఆర్డర్ #${id} (${prod} - ₹${price.toLocaleString()}) గురించి కాల్ చేస్తున్నాను. నేను రాజేష్ కుమార్ తో మాట్లాడుతున్నానಾ?`,
    quickReplies: ['అవును, నేనే', 'ఎవరు మీరు?', 'తప్పు నంబರ್', 'ఎందుకు కాల్ చేశారు?']
  },
  { 
    code: 'ml-IN', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    getGreeting: (prod, price, id) => `നമസ്കാരം രാജേഷ്! ഞാൻ നിങ്ങളുടെ Razorpay Assistant ആണ്. ഓർഡർ #${id} (${prod} - ₹${price.toLocaleString()}) സംബന്ധിച്ചാണ് ഈ കോൾ. ഞാൻ സംസാരിക്കുന്നത് രാജേഷ് കുമാറിനോടാണോ?`,
    quickReplies: ['അതെ, ഞാൻ തന്നെ', 'ആരാണ് സംസാരിക്കുന്നത്?', 'നമ്പർ തെറ്റാണ്', 'എന്തിനാണ് വിളിക്കുന്നത്?']
  }
];

function VoiceRecoveryContent() {
  const searchParams = useSearchParams();

  // Connected Order Context from Demo / Failed Checkout
  const productName = searchParams.get('product') || 'Apple AirPods Pro (2nd Gen)';
  const productPrice = Number(searchParams.get('price')) || 4650;
  const orderId = searchParams.get('orderId') || 'RZP-8921';
  const failureReason = searchParams.get('error') || 'E_504_GATEWAY_TIMEOUT';
  const customerName = searchParams.get('customer') || 'Rajesh Kumar';

  const discountPrice = Math.round(productPrice * 0.95);
  const discountSavings = productPrice - discountPrice;

  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [callState, setCallState] = useState<'IDLE' | 'LISTENING' | 'ANALYZING' | 'AI_SPEAKING'>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [customText, setCustomText] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const [conversationHistory, setConversationHistory] = useState<MessageTurn[]>([
    {
      id: 'msg-0',
      role: 'agent',
      text: SUPPORTED_LANGUAGES[0].getGreeting(productName, productPrice, orderId),
      timestamp: '00:00',
      lang: 'English',
      quickReplies: ['Yes, speaking.', 'Who is this?', 'Wrong Number', 'Why are you calling?']
    }
  ]);
  
  const [parsedIntent, setParsedIntent] = useState<any>({
    intent: 'GREETING',
    sentiment: 'Attentive',
    action: `Verified customer identity for ${productName} (₹${productPrice.toLocaleString()})`
  });

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, callState]);

  // Handle Dynamic Language Switch
  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLang(lang);
    const greetingText = lang.getGreeting(productName, productPrice, orderId);
    const updatedGreeting: MessageTurn = {
      id: `agent-lang-${Date.now()}`,
      role: 'agent',
      text: greetingText,
      timestamp: formatCallTime(callDuration),
      lang: lang.name,
      quickReplies: lang.quickReplies
    };
    setConversationHistory(prev => [...prev, updatedGreeting]);
    speakAIResponse(greetingText, lang.code);
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const speakAIResponse = (text: string, langCode: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    setCallState('AI_SPEAKING');
    utterance.onend = () => setCallState('IDLE');
    utterance.onerror = () => setCallState('IDLE');
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    setRecognitionError(null);
    setCurrentSpokenText('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang.code;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setCallState('LISTENING');
      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        setCurrentSpokenText(fullTranscript.trim());
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setCallState('IDLE');
    }
  };

  const finishSpeakingAndAnalyze = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    const textToProcess = currentSpokenText.trim();
    if (!textToProcess) {
      setCallState('IDLE');
      return;
    }
    handleTurnSubmit(textToProcess);
  };

  const handleTurnSubmit = (textToSubmit: string) => {
    if (!textToSubmit.trim() || callState === 'AI_SPEAKING') return;

    const customerMsg: MessageTurn = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      text: textToSubmit,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    };

    const updatedHistory = [...conversationHistory, customerMsg];
    setConversationHistory(updatedHistory);
    setCustomText('');
    processInspectTurn(textToSubmit, updatedHistory);
  };

  const triggerTestScenario = (type: 'WRONG_NUMBER' | 'CANCEL_PROBE' | 'REFUND_T0' | 'HUMAN_ESCALATE') => {
    if (callState === 'AI_SPEAKING') return;
    if (type === 'WRONG_NUMBER') handleTurnSubmit('Wrong number, I am not Rajesh.');
    if (type === 'CANCEL_PROBE') handleTurnSubmit('I want to cancel this order.');
    if (type === 'REFUND_T0') handleTurnSubmit('Money was deducted from my bank, refund immediately.');
    if (type === 'HUMAN_ESCALATE') handleTurnSubmit('Connect me to a senior human manager.');
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://revenueos-backend.onrender.com';

  const processInspectTurn = async (text: string, currentHistory: MessageTurn[]) => {
    setCallState('ANALYZING');
    const t = text.toLowerCase().trim();
    let reply = '';
    let intent = 'GENERAL_QUERY';
    let sentiment = 'Attentive';
    let action = `Assisting customer with ${productName} (₹${productPrice.toLocaleString()})`;
    let chips = ['Send on WhatsApp', 'Send via SMS', 'Talk to Manager'];

    // 1. Try calling the real FastAPI backend turn endpoint
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);
      const res = await fetch(`${API_BASE_URL}/api/v1/voice/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: selectedLang.code,
          customer_name: customerName,
          order_id: orderId,
          sku: productName,
          amount: productPrice,
          failure_code: failureReason,
          demo_mode: searchParams.get('demo') === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
          history: currentHistory.map(h => ({ role: h.role, text: h.text }))
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply_text) {
          reply = data.reply_text;
          intent = data.intent || 'VOICE_AGENT_RESOLVED';
          action = data.action_logged || action;
          if (data.quick_replies && data.quick_replies.length > 0) {
            chips = data.quick_replies;
          }
          if (data.trigger_whatsapp_link || data.intent === 'WHATSAPP_LINK_ACTIVE' || data.intent === 'PRICE_RETENTION_ACCEPTED') {
            setShowWhatsAppPopup(true);
          }
        }
      }
    } catch {
      // Backend asleep or offline — seamlessly use enhanced local semantic classifier
    }

    // 2. If reply is still empty, use enhanced local semantic classification engine
    if (!reply) {

    // ── 1. CANCELLATION CONFIRMATION / FINAL OPT-OUT ──────────────────────
    if (['no reason, just cancel', 'still cancel order', 'ordered by mistake', 'confirm cancel', 'yes cancel', 'just cancel', 'cancel'].includes(t) || /\b(just cancel|confirm cancel|ordered by mistake|no reason)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ಸರಿ ರಾಜೇಶ್ ಅವರೇ. ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಆರ್ಡರ್ #${orderId} (${productName}) ಅನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ಯಾವುದೇ ಶುಲ್ಕ ವಿಧಿಸಲಾಗುವುದಿಲ್ಲ. ಧನ್ಯವಾದಗಳು.`
        : selectedLang.code === 'hi-IN'
          ? `ठीक है राजेश जी। आपके अनुरोध पर Order #${orderId} (${productName}) रद्द कर दिया गया है। कोई शुल्क नहीं लिया जाएगा। धन्यवाद।`
          : `Understood, Rajesh. As requested, Order #${orderId} for ${productName} has been cancelled and your reservation released. No charges were incurred. Thank you!`;
      intent = 'ORDER_CANCELLED';
      sentiment = 'Neutral';
      action = `Order #${orderId} (${productName}) cancelled upon customer confirmation`;
      chips = ['Done, Thank You', 'Re-order Product'];
    }
    // ── 2. INITIAL CANCELLATION REQUEST -> MOTIVE PROBE ───────────────────
    else if (['i want to cancel', 'cancel order', 'cancel this order', "don't want", 'dont want', 'rather not go ahead'].includes(t) || /\b(cancel|rather not|second thoughts|drop this|hold off|dont want|don't want|stop order|not interested|change my mind|रद्द|ಕ್ಯಾನ್ಸಲ್)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ಅರ್ಥಮಾಡಿಕೊಂಡೆ. #${orderId} ರದ್ದು ಮಾಡುವ ಮೊದಲು: ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ, ವಿತರಣೆ ವಿಳಂಬವೇ, ಅಥವಾ ಬೇರೆ ಕಾರಣವೇ? ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.`
        : selectedLang.code === 'hi-IN'
          ? `समझ गया। #${orderId} रद्द करने से पहले — क्या कारण है: कीमत ज़्यादा है, डिलीवरी में देरी है, या कोई और बात?`
          : `I understand. Before processing cancellation for Order #${orderId} (${productName}), may I ask the reason: is it because of the price, delivery timing, or something else?`;
      intent = 'CANCEL_INSPECTION';
      sentiment = 'Objecting';
      action = `Cancellation motive probe initiated for ${productName}`;
      chips = ['Price is too high', 'Delivery delay', 'Ordered by mistake', 'No reason, just cancel'];
    }
    // ── 3. PRICE OBJECTION / DYNAMIC 5% DISCOUNT (SAVE232) ────────────────
    else if (['price is too high', 'too expensive', 'price objection', `✓ accept ₹${discountPrice.toLocaleString()} offer`, 'accept offer', 'give discount'].includes(t) || t.includes('accept') || /\b(price|expensive|steep|cost|discount|offer|budget|too high|affordable|ದುಬಾರಿ|महंगा|ज्यादा)\b/i.test(t)) {
      if (t.includes('accept')) {
        reply = selectedLang.code === 'hi-IN'
          ? `शानदार! SAVE232 कोड से ₹${discountSavings.toLocaleString()} की छूट लागू हो गई। नई कुल रकम ₹${discountPrice.toLocaleString()} है। WhatsApp पर 1-Tap UPI लिंक भेज दिया गया है!`
          : `Great choice! Code SAVE232 applied — saved ₹${discountSavings.toLocaleString()}! Your new total for ${productName} is ₹${discountPrice.toLocaleString()}. Dispatched the updated 1-Tap payment link to WhatsApp!`;
        intent = 'PRICE_RETENTION_ACCEPTED';
        action = `PolicyGuard: Applied approved 5% loyalty code SAVE232 (₹${discountPrice.toLocaleString()})`;
        setShowWhatsAppPopup(true);
        chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Paid via Paytm', 'Talk to Manager'];
      } else {
        reply = selectedLang.code === 'kn-IN'
          ? `ನಿಮ್ಮ ಗ್ರಾಹಕ ನಿಷ್ಠೆಗಾಗಿ ನಾನು 5% ರಿಯಾಯಿತಿ (SAVE232) ಅನ್ವಯಿಸಿ ಒಟ್ಟು ಮೊತ್ತವನ್ನು ₹${discountPrice.toLocaleString()} ಗೆ ಇಳಿಸಬಲ್ಲೆ. ಈ ಆಫರ್ ಸ್ವೀಕರಿಸಲು ಬಯಸುತ್ತೀರಾ?`
          : selectedLang.code === 'hi-IN'
            ? `मैं आपके लिए 5% loyalty discount (SAVE232) लागू करके ${productName} की कुल रकम ₹${discountPrice.toLocaleString()} कर सकता हूँ। क्या आप इसे स्वीकार करेंगे?`
            : `I can apply an authorized 5% loyalty discount (SAVE232) for your ${productName}, bringing your total to ₹${discountPrice.toLocaleString()} (saving ₹${discountSavings.toLocaleString()}). Would you like to accept this offer?`;
        intent = 'PRICE_RETENTION';
        action = `PolicyGuard: Quoted authorized 5% loyalty discount SAVE232 (₹${discountPrice.toLocaleString()})`;
        chips = [`✓ Accept ₹${discountPrice.toLocaleString()} Offer`, 'Send on WhatsApp', 'No reason, just cancel'];
      }
    }
    // ── 4. DELIVERY DELAY -> PRIORITY EXPRESS UPGRADE ─────────────────────
    else if (['delivery delay', 'late delivery', 'priority dispatch', 'taking too long'].includes(t) || /\b(delay|slow|delivery|late|parcel|taking too long|not arrived|when will i get|ತಡ|ವಿಳಂಬ|देरी)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ಅರ್ಥವಾಯಿತು! ನಿಮ್ಮ ${productName} ಅನ್ನು '24-Hour Priority Express Dispatch' ಗೆ ಉಚಿತವಾಗಿ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿದ್ದೇನೆ. ಪಾವತಿ ಲಿಂಕ್ WhatsApp ಮೂಲಕ ಕಳುಹಿಸಲೆ?`
        : selectedLang.code === 'hi-IN'
          ? `समझ गया! मैंने आपके ${productName} को '24-Hour Priority Express' में बिना अतिरिक्त शुल्क अपग्रेड कर दिया है। क्या पेमेंट लिंक WhatsApp पर भेज दूँ?`
          : `Understood! I have upgraded Order #${orderId} (${productName}) to 24-Hour Priority Express Dispatch at zero extra cost. Shall I send the 1-Tap payment link via WhatsApp?`;
      intent = 'DELIVERY_EXPEDITE';
      action = `PolicyGuard: Upgraded shipping for ${productName} to Priority 24-Hour Express (cost=0)`;
      chips = ['Send on WhatsApp', 'Send via SMS', 'Talk to Manager'];
    }
    // ── 5. WHATSAPP UPI PAYMENT DISPATCH ───────────────────────────────────
    else if (['send on whatsapp', 'open whatsapp link', 'send whatsapp link', 'open whatsapp', 'whatsapp', 'gpay', 'phonepe', 'paytm', 'switch to upi'].includes(t) || /\b(whatsapp|upi|gpay|phonepe|paytm|ವಾಟ್ಸಾಪ್|ಯುಪಿಐ|व्हाट्सएप|यूपीआई)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ನಿಮ್ಮ WhatsApp (+91 98450 XXXXX) ಗೆ ಅಧಿಕೃತ Razorpay 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ. Google Pay ಅಥವಾ PhonePe ಬಳಸಿ ₹${productPrice.toLocaleString()} ಪಾವತಿಸಬಹುದು.`
        : selectedLang.code === 'hi-IN'
          ? `आपके WhatsApp (+91 98450 XXXXX) पर Razorpay का 1-Tap UPI लिंक भेज दिया गया है। Google Pay या PhonePe से ₹${productPrice.toLocaleString()} का भुगतान करें।`
          : `Done! Your verified Razorpay 1-Tap UPI link for ${productName} (₹${productPrice.toLocaleString()}) has been sent to WhatsApp (+91 98450 XXXXX). Tap it to complete payment via Google Pay, PhonePe, or Paytm!`;
      intent = 'WHATSAPP_LINK_ACTIVE';
      action = `Dispatched verified Razorpay 1-Tap UPI WhatsApp deep links for ₹${productPrice.toLocaleString()}`;
      setShowWhatsAppPopup(true);
      chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Paid via Paytm', 'Talk to Manager'];
    }
    // ── 6. SMS LINK DISPATCH ──────────────────────────────────────────────
    else if (['send via sms', 'send sms copy', 'send sms', 'sms link', 'sms'].includes(t) || /\b(sms|text|message|text me|ಎಸ್ಎಂಎಸ್|एसएमएस)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `SMS ಕಳುಹಿಸಲಾಗಿದೆ! +91 98450 XXXXX ಗೆ 1-ಟ್ಯಾಪ್ ಪಾವತಿ ಲಿಂಕ್ ತಲುಪಿದೆ. ₹${productPrice.toLocaleString()} ಪಾವತಿ ಮಾಡಲು ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`
        : selectedLang.code === 'hi-IN'
          ? `SMS भेज दिया गया! +91 98450 XXXXX पर 1-Tap लिंक पहुँच गया है। ₹${productPrice.toLocaleString()} का भुगतान करने के लिए लिंक पर क्लिक करें।`
          : `SMS sent! The 1-Tap payment link has been delivered to +91 98450 XXXXX. Click it to pay ₹${productPrice.toLocaleString()} in one tap using any UPI app.`;
      intent = 'SMS_DISPATCHED';
      action = `Dispatched verified Razorpay 1-Tap SMS payment link for ₹${productPrice.toLocaleString()}`;
      chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Talk to Manager'];
    }
    // ── 7. IDENTITY CONFIRMATION ("Yes, speaking") ────────────────────────
    else if (['yes, speaking.', 'yes, speaking', 'yes speaking', 'yes, complete order', 'yes i am', 'confirm order', 'speaking', 'yes', 'ಹೌದು, ನಾನೇ', 'हाँ, बोल रहा हूँ'].includes(t) || /\b(yes|speaking|correct|right|ಹೌದು|ನಾನೇ|हाँ|बोल रहा)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ಧನ್ಯವಾದಗಳು ರಾಜೇಶ್! ನಿಮ್ಮ HDFC ಕಾರ್ಡ್ ${failureReason} ಕಾರಣ ವಿಫಲವಾಗಿದೆ. ಯಾವುದೇ ಹಣ ಕಡಿತಗೊಂಡಿಲ್ಲ. WhatsApp ಅಥವಾ SMS ಮೂಲಕ ₹${productPrice.toLocaleString()} 1-ಟ್ಯಾಪ್ UPI ಲಿಂಕ್ ಕಳುಹಿಸಲೆ?`
        : selectedLang.code === 'hi-IN'
          ? `धन्यवाद राजेश! आपका HDFC कार्ड ${failureReason} टाइमआउट से रुका था। कोई रकम नहीं कटी। WhatsApp या SMS पर ₹${productPrice.toLocaleString()} का 1-Tap UPI लिंक भेजूँ?`
          : `Thank you Rajesh! Your HDFC card payment for ${productName} timed out at the bank gateway (${failureReason}). No amount was debited. Shall I send the 1-Tap UPI payment link for ₹${productPrice.toLocaleString()} via WhatsApp or SMS?`;
      intent = 'IDENTITY_CONFIRMED';
      sentiment = 'Cooperative';
      action = `Identity verified, payment recovery link ready for ${productName} (₹${productPrice.toLocaleString()})`;
      chips = ['Send on WhatsApp', 'Price is too high', 'I want to cancel', 'Check Refund'];
    }
    // ── 8. DOUBLE-DEBIT / REFUND STATUS CHECK ─────────────────────────────
    else if (['check refund', 'refund check', 'refund', 'money was deducted', 'double debit'].includes(t) || /\b(refund|deducted|money cut|cut money|double debit|ರಿಫಂಡ್|ರದ್ದು|रिफंड)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ದೃಢೀಕೃತ ವರದಿ: NPCI UTR #904288192014 ಮೂಲಕ ₹${productPrice.toLocaleString()} ಮೊತ್ತವನ್ನು T+0 ಇನ್‌ಸ್ಟಂಟ್ ರಿವರ್ಸಲ್‌ನಲ್ಲಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ. ರಶೀದಿ WhatsApp ನಲ್ಲಿದೆ.`
        : selectedLang.code === 'hi-IN'
          ? `सत्यापित रिपोर्ट: NPCI UTR #904288192014 के तहत ₹${productPrice.toLocaleString()} का T+0 instant refund प्रोसेस कर दिया गया है।`
          : `Audit Verified: NPCI UTR #904288192014 confirms ₹${productPrice.toLocaleString()} reversal executed via T+0 instant rail in 2.18s. Tax receipt sent to WhatsApp.`;
      intent = 'T0_REFUND_EXECUTED';
      action = `Reconciliation Engine: Verified T+0 reversal UTR #904288192014 for ₹${productPrice.toLocaleString()}`;
      chips = ['✓ View NPCI Receipt', 'Re-order Product', 'Talk to Manager'];
    }
    // ── 9. HUMAN ESCALATION ───────────────────────────────────────────────
    else if (['talk to manager', 'talk to human', 'connect to human', '✓ connected with manager', 'i need a human', 'manager transfer'].includes(t) || /\b(human|manager|senior|officer|supervisor|real person|customer care|ವಿಕ್ರಮ್|ಮ್ಯಾನೇಜರ್|इंसान|अधिकारी)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ಖಂಡಿತ! ನಿಮ್ಮ ಆರ್ಡರ್ #${orderId} (${productName}) ವಿವರಗಳೊಂದಿಗೆ ಹಿರಿಯ ಮ್ಯಾನೇಜರ್ ವಿಕ್ರಮ್ ಅವರಿಗೆ ಲೈವ್ ಕಾಲ್ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ. 5 ಸೆಕೆಂಡುಗಳು ಹೋಲ್ಡ್‌ನಲ್ಲಿರಿ.`
        : selectedLang.code === 'hi-IN'
          ? `बिल्कुल! आपका Order #${orderId} (${productName}) का पूरा केस Senior Manager Vikram को transfer किया जा रहा है। 5 सेकंड होल्ड करें।`
          : `Certainly! Transferring your call and order context for #${orderId} (${productName}) directly to Senior Support Manager Vikram. Please hold for 5 seconds.`;
      intent = 'HUMAN_ESCALATION';
      action = `Live call transferred to Senior Support Desk (Manager Vikram) for Order #${orderId}`;
      chips = ['✓ Connected with Manager', 'Cancel Transfer'];
    }
    // ── 10. WRONG NUMBER / DND STOPPING RULE ──────────────────────────────
    else if (['wrong number', 'not rajesh', 'stop calling', "don't call me", 'dnd', 'remove my number'].includes(t) || /\b(wrong number|not rajesh|stop calling|remove my number|don't call|ತಪ್ಪು ಸಂಖ್ಯೆ|गलत नंबर|தவறான எண்)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಕ್ಷಮಿಸಿ! ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು DND ಪಟ್ಟಿಯಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಇನ್ನು ಯಾವುದೇ ಕರೆಗಳು ಬರುವುದಿಲ್ಲ."
        : selectedLang.code === 'hi-IN'
          ? "माफ़ी चाहते हैं। आपका नंबर DND लिस्ट में जोड़ दिया गया है, आगे कोई कॉल नहीं आएगी।"
          : "My apologies! Your number has been registered on our DND list. All automated outreach is halted immediately.";
      intent = 'DND_STOPPING_RULE';
      sentiment = 'Identity Refusal (DND)';
      action = 'DPDP / DNC Rule Triggered: Suppressed further retries (0 retries)';
      chips = ['Done, Thank You'];
    }
    // ── 11. PAYMENT COMPLETED CONFIRMATION ────────────────────────────────
    else if (['paid via google pay', 'paid via phonepe', 'paid via paytm', 'paid via upi', '✓ order complete', 'payment done', 'already paid', 'i paid'].includes(t) || /\b(paid|done|completed|already paid|i paid|sent money|ಪಾವತಿಸಿದೆ|ಮಾಡಿದೆ|भुगतान किया|செலுத்தப்பட்டது)\b/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ಅದ್ಭುತ ರಾಜೇಶ್ ಅವರೇ! ನಿಮ್ಮ ₹${productPrice.toLocaleString()} ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಆರ್ಡರ್ #${orderId} ರವಾನೆಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ. ರಶೀದಿ WhatsApp ನಲ್ಲಿದೆ. ಧನ್ಯವಾದಗಳು!`
        : selectedLang.code === 'hi-IN'
          ? `शानदार राजेश जी! आपका ₹${productPrice.toLocaleString()} का भुगतान सत्यापित हो गया है। Order #${orderId} (${productName}) डिस्पेच के लिए तैयार है। रसीद WhatsApp पर भेज दी गई है!`
          : `Awesome Rajesh! Your payment of ₹${productPrice.toLocaleString()} for ${productName} is confirmed. Order #${orderId} is approved for Priority Express Dispatch. Tax invoice sent to WhatsApp. Enjoy your product!`;
      intent = 'PAYMENT_CONFIRMED';
      sentiment = 'Satisfied';
      action = `Payment of ₹${productPrice.toLocaleString()} confirmed via webhook, invoice generated, priority warehouse dispatch approved`;
      chips = ['✓ Order Complete', 'Download Tax Invoice'];
    }
    // ── 12. GREETINGS & PURPOSE INQUIRY ───────────────────────────────────
    else if (['who is this?', 'who is this', 'why are you calling?', 'why are you calling', 'hello', 'hi', 'hey', 'namaste'].includes(t) || /^(hello|hi|hey|namaste|namaskara|vanakkam|who is this|why are you calling|who are you|ಯಾರು ನೀವು|ಯಾಕೆ ಕರೆ ಮಾಡಿದ್ದೀರಿ|आप कौन हैं|कॉल क्यों किया)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? `ನಮಸ್ಕಾರ ರಾಜೇಶ್! ನಿಮ್ಮ ಆರ್ಡರ್ #${orderId} (${productName} - ₹${productPrice.toLocaleString()}) HDFC ಬ್ಯಾಂಕ್ ಟೈಮ್ಔಟ್ ಕಾರಣ ಪೆಂಡಿಂಗ್ ಇದೆ. ನೀವು ಇದನ್ನು 1-ಟ್ಯಾಪ್ UPI ಮೂಲಕ ಪೂರ್ಣಗೊಳಿಸಲು ಬಯಸುತ್ತೀರಾ?`
        : selectedLang.code === 'hi-IN'
          ? `नमस्ते राजेश जी! मैं Razorpay Assistant बोल रहा हूँ। आपका Order #${orderId} (${productName} - ₹${productPrice.toLocaleString()}) HDFC बैंक टाइमआउट के कारण पेंडिंग है। क्या आप इसे 1-Tap UPI से पूरा करना चाहते हैं?`
          : `Hello Rajesh! I am calling from Razorpay Support regarding your pending Order #${orderId} (${productName} - ₹${productPrice.toLocaleString()}) which timed out at the bank. Would you like to complete this order via 1-Tap UPI or check refund status?`;
      intent = 'GREETING_AND_CONTEXT';
      chips = ['Yes, Complete Order', 'Send on WhatsApp', 'I want to cancel', 'Talk to Manager'];
    }
    // ── DEFAULT FALLBACK ──────────────────────────────────────────────────
    else {
      reply = selectedLang.code === 'kn-IN'
        ? `ಖಂಡಿತ, ನಿಮ್ಮ ಆರ್ಡರ್ #${orderId} (${productName} - ₹${productPrice.toLocaleString()}) ಸಂಬಂಧಿಸಿದಂತೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`
        : selectedLang.code === 'hi-IN'
          ? `जी, मैं आपके Order #${orderId} (${productName} - ₹${productPrice.toLocaleString()}) के संबंध में आपकी किस प्रकार सहायता कर सकता हूँ?`
          : `I am assisting you regarding Order #${orderId} (${productName} - ₹${productPrice.toLocaleString()}). Would you like to complete payment, check refund, or speak with an executive?`;
      intent = 'GENERAL_QUERY';
      chips = ['Send on WhatsApp', 'Send via SMS', 'I want to cancel', 'Talk to Manager'];
    }
    } // End if (!reply) fallback

    setParsedIntent({ intent, sentiment, action });

    const agentMsg: MessageTurn = {
      id: `agent-${Date.now()}`,
      role: 'agent',
      text: reply,
      timestamp: formatCallTime(callDuration + 1),
      lang: selectedLang.name,
      quickReplies: chips
    };

    setConversationHistory(prev => [...prev, agentMsg]);
    speakAIResponse(reply, selectedLang.code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6 md:p-8 font-sans">
      
      {/* Top Banner: Connected Context from Failed Checkout / Simulator */}
      <div className="mb-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 flex-shrink-0">
            <Package size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Live Recoverable Cart Linked:</span>
              <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                {failureReason}
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              {productName} • <span className="text-emerald-400">₹{productPrice.toLocaleString()}</span> • Order #{orderId}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Customer:</span>
          <span className="font-semibold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-gray-700">{customerName}</span>
          <Link href="/demo" className="text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/60 px-2.5 py-1 rounded-lg transition flex items-center space-x-1">
            <span>Change SKU in Demo</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Phone size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              Voice Recovery Assistant
              <span className="ml-3 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-medium">
                PolicyGuard Active
              </span>
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Multi-turn conversational AI with vernacular dialect matching and strict financial firewalls.
            </p>
          </div>
        </div>

        {/* Dialect Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-gray-800 p-1.5 rounded-xl overflow-x-auto">
          <Languages size={15} className="text-gray-400 ml-1 mr-1" />
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition whitespace-nowrap ${
                selectedLang.code === lang.code
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </header>

      {/* Quick Test Scenarios Bar */}
      <div className="mb-6 bg-slate-900/60 border border-gray-800 rounded-xl p-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-xs font-semibold text-gray-300">Quick Test Scenarios:</span>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={() => triggerTestScenario('CANCEL_PROBE')}
            className="px-3 py-1 bg-red-950/40 border border-red-800/60 hover:bg-red-900/40 text-red-300 text-xs rounded-lg transition font-medium flex items-center"
          >
            <Ban size={12} className="mr-1.5" /> 1. Cancel Order
          </button>
          <button
            onClick={() => triggerTestScenario('REFUND_T0')}
            className="px-3 py-1 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 text-emerald-300 text-xs rounded-lg transition font-medium flex items-center"
          >
            <RefreshCw size={12} className="mr-1.5" /> 2. Refund Check
          </button>
          <button
            onClick={() => triggerTestScenario('HUMAN_ESCALATE')}
            className="px-3 py-1 bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/40 text-purple-300 text-xs rounded-lg transition font-medium flex items-center"
          >
            <UserPlus size={12} className="mr-1.5" /> 3. Manager Transfer
          </button>
          <button
            onClick={() => triggerTestScenario('WRONG_NUMBER')}
            className="px-3 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-gray-300 text-xs rounded-lg transition font-medium flex items-center"
          >
            <ShieldAlert size={12} className="mr-1.5" /> 4. Wrong Number / DND
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat / Voice Console (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-gray-800 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-xl">
          
          {/* Console Header */}
          <div className="bg-slate-900/90 border-b border-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                Live Call: Razorpay Assistant → {customerName}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">({formatCallTime(callDuration)})</span>
            </div>
            <button
              onClick={() => {
                setConversationHistory([{
                  id: 'msg-reset',
                  role: 'agent',
                  text: selectedLang.getGreeting(productName, productPrice, orderId),
                  timestamp: '00:00',
                  lang: selectedLang.name,
                  quickReplies: selectedLang.quickReplies
                }]);
                setCallDuration(0);
              }}
              className="text-xs text-gray-400 hover:text-white flex items-center transition border border-gray-700 px-2 py-1 rounded-lg"
            >
              <RotateCcw size={11} className="mr-1" /> Reset Call
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
            {conversationHistory.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-gray-500 mb-1 px-1">
                  {msg.role === 'customer' ? 'Customer' : 'Razorpay Assistant'} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'customer'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-slate-800/90 border border-gray-700/60 text-gray-100 rounded-bl-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Reply Chips */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {msg.quickReplies.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTurnSubmit(chip)}
                        className="text-[11px] bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/50 border border-gray-700 text-gray-300 hover:text-white px-2.5 py-1 rounded-full transition"
                      >
                        › {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {callState === 'ANALYZING' && (
              <div className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-950/30 border border-blue-500/20 p-2.5 rounded-xl w-fit">
                <Sparkles size={13} className="animate-spin" />
                <span>PolicyGuard analyzing intent & enforcing financial rules...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-slate-900 border-t border-gray-800 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTurnSubmit(customText)}
                placeholder={`Type your response in ${selectedLang.name} (e.g. "I want to pay", "Why are you calling", "Too expensive")...`}
                className="flex-1 bg-slate-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => handleTurnSubmit(customText)}
                disabled={!customText.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={callState === 'LISTENING' ? finishSpeakingAndAnalyze : startListening}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                  callState === 'LISTENING'
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30'
                }`}
              >
                {callState === 'LISTENING' ? (
                  <><MicOff size={14} /><span>Listening... Tap to Send</span></>
                ) : (
                  <><Mic size={14} /><span>TAP TO SPEAK (Microphone)</span></>
                )}
              </button>

              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition ${
                  ttsEnabled ? 'bg-slate-800 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-gray-400 border-gray-700'
                }`}
              >
                TTS Audio: {ttsEnabled ? 'ON 🔊' : 'OFF 🔇'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Telecaller Audit Panel (1 Col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Telecaller Audit</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                Verified ✓
              </span>
            </div>

            {/* Target Order & SKU Details */}
            <div className="bg-slate-950 p-3 rounded-xl border border-gray-800 space-y-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Connected Target Cart</span>
              <p className="text-xs font-bold text-white">{productName}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-mono text-blue-400 font-bold">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Cart Amount:</span>
                <span className="font-bold text-emerald-400">₹{productPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Failure Trigger:</span>
                <span className="text-red-400 font-mono text-[11px]">{failureReason}</span>
              </div>
            </div>

            {/* Detected Intent */}
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Detected Intent</span>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-gray-800">
                <p className="text-xs font-mono font-bold text-blue-300">{parsedIntent.intent}</p>
              </div>
            </div>

            {/* Customer Sentiment */}
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Customer Sentiment</span>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-gray-800">
                <p className="text-xs font-semibold text-emerald-400">{parsedIntent.sentiment}</p>
              </div>
            </div>

            {/* PolicyGuard Enforcement Action */}
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">PolicyGuard Rule Action</span>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-gray-800">
                <p className="text-xs text-blue-300 leading-snug">{parsedIntent.action}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp UPI Modal Preview */}
          {showWhatsAppPopup && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 animate-in fade-in space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                <Smartphone size={15} />
                <span>WhatsApp 1-Tap UPI Link Active</span>
              </div>
              <p className="text-[11px] text-gray-300">
                Customer received official Razorpay deep links on WhatsApp for ₹{productPrice.toLocaleString()} (or ₹{discountPrice.toLocaleString()} if discounted).
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleTurnSubmit('Paid via Google Pay')}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Simulate GPay Pay
                </button>
                <button
                  onClick={() => setShowWhatsAppPopup(false)}
                  className="px-2 py-1.5 bg-slate-800 text-gray-400 hover:text-white rounded-lg text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function VoiceRecoveryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading Voice Recovery Engine...</div>}>
      <VoiceRecoveryContent />
    </Suspense>
  );
}
