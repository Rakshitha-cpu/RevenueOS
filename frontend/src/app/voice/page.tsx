'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Languages, Send, Phone, RotateCcw, Smartphone,
  Sparkles, ShieldCheck, ChevronRight, Ban, RefreshCw, UserPlus, ShieldAlert, CheckCircle2
} from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  initialGreeting: string;
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
    initialGreeting: 'Hello Rajesh! This is your Razorpay Assistant calling regarding your Order #RZP-8921 (₹4,650 - Apple AirPods Pro). Am I speaking with Rajesh Kumar?',
    quickReplies: ['Yes, speaking.', 'Who is this?', 'Wrong Number', 'Why are you calling?']
  },
  { 
    code: 'kn-IN', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    initialGreeting: 'ನಮಸ್ಕಾರ ರಾಜೇಶ್! ನಾನು ನಿಮ್ಮ Razorpay Assistant ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 (₹4,650) ಕುರಿತು ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ನಾನು ರಾಜೇಶ್ ಅವರೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಿದ್ದೇನಾ?',
    quickReplies: ['ಹೌದು, ನಾನೇ', 'ಯಾರು ನೀವು?', 'ತಪ್ಪು ಸಂಖ್ಯೆ', 'ಯಾಕೆ ಕರೆ ಮಾಡಿದ್ದೀರಿ?']
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिंदी', 
    initialGreeting: 'नमस्ते राजेश! मैं आपका Razorpay Assistant बोल रहा हूँ। आपके Order #RZP-8921 (₹4,650) के बारे में call कर रहा हूँ। क्या मैं Rajesh Kumar से बात कर रहा हूँ?',
    quickReplies: ['हाँ, बोल रहा हूँ', 'आप कौन हैं?', 'गलत नंबर', 'कॉल क्यों किया?']
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    initialGreeting: 'வணக்கம் ராஜேஷ்! நான் உங்கள் Razorpay Assistant பேசுகிறேன். உங்கள் ஆர்டர் #RZP-8921 (₹4,650) குறித்து அழைக்கிறேன். நான் ராஜேஷ் குமாரிடம் பேசுகிறேனா?',
    quickReplies: ['ஆமாம், நான்தான்', 'யார் நீங்கள்?', 'தவறான எண்', 'ஏன் அழைத்தீர்கள்?']
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    initialGreeting: 'నమస్కారం రాజేష్! నేను మీ Razorpay Assistant మాట్లాడుతున్నాను. మీ ఆర్ಡర్ #RZP-8921 (₹4,650) గురించి కాల్ చేస్తున్నాను. నేను రాజేష్ కుమార్ తో మాట్లాడుతున్నానా?',
    quickReplies: ['అవును, నేనే', 'ఎవరు మీరు?', 'తప్పు నంబర్', 'ఎందుకు కాల్ చేశారు?']
  },
  { 
    code: 'ml-IN', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    initialGreeting: 'നമസ്കാരം രാജേഷ്! ഞാൻ നിങ്ങളുടെ Razorpay Assistant ആണ്. നിങ്ങളുടെ ഓർഡർ #RZP-8921 (₹4,650) സംബന്ധിച്ചാണ് ഈ കോൾ. ഞാൻ സംസാരിക്കുന്നത് രാജേഷ് കുമാറിനോടാണോ?',
    quickReplies: ['അതെ, ഞാൻ തന്നെ', 'ആരാണ് സംസാരിക്കുന്നത്?', 'നമ്പർ തെറ്റാണ്', 'എന്തിനാണ് വിളിക്കുന്നത്?']
  }
];

export default function VoiceRecovery() {
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
      text: SUPPORTED_LANGUAGES[0].initialGreeting,
      timestamp: '00:00',
      lang: 'English',
      quickReplies: ['Yes, speaking.', 'Who is this?', 'Wrong Number', 'Why are you calling?']
    }
  ]);
  
  const [parsedIntent, setParsedIntent] = useState<any>({
    intent: 'GREETING',
    sentiment: 'Attentive',
    action: 'Verified customer identity and stated pending order context'
  });

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLang(lang);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setCallState('IDLE');
    setCurrentSpokenText('');
    setShowWhatsAppPopup(false);
    setCallDuration(0);

    setConversationHistory([
      {
        id: `msg-${Date.now()}`,
        role: 'agent',
        text: lang.initialGreeting,
        timestamp: '00:00',
        lang: lang.name,
        quickReplies: lang.quickReplies
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
    } catch (err: any) {
      setCallState('IDLE');
    }
  };

  const finishSpeakingAndAnalyze = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
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

  const processInspectTurn = async (text: string, currentHistory: MessageTurn[]) => {
    setCallState('ANALYZING');
    const t = text.toLowerCase().trim();
    let reply = '';
    let intent = 'GENERAL_QUERY';
    let sentiment = 'Attentive';
    let action = 'Assisting customer with pending order';
    let chips = ['Send SMS Copy', 'Open WhatsApp Link', 'Talk to Manager'];

    // ── CHIP BUTTON EXACT MATCHES (must be first, before regex) ──────────────
    if (['send on whatsapp', 'open whatsapp link', 'send whatsapp link', 'send payment via whatsapp'].includes(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ನಿಮ್ಮ WhatsApp ನಲ್ಲಿ ಅಧಿಕೃತ Razorpay 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ. ನೀವು Google Pay ಅಥವಾ PhonePe ಬಳಸಿ ₹4,650 ಪಾವತಿ ಮಾಡಬಹುದು."
        : selectedLang.code === 'hi-IN'
          ? "आपके WhatsApp पर Razorpay का 1-Tap UPI लिंक भेज दिया गया है। Google Pay या PhonePe से ₹4,650 का भुगतान करें।"
          : "Done! Your verified Razorpay 1-Tap UPI link has been sent to WhatsApp (+91 98450 XXXXX). Tap it to pay ₹4,650 via Google Pay, PhonePe, or Paytm — takes under 10 seconds!";
      intent = 'WHATSAPP_LINK_ACTIVE';
      action = 'WhatsApp UPI link dispatched to customer';
      setShowWhatsAppPopup(true);
      chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Paid via Paytm', 'Talk to Manager'];
    } else if (['send via sms', 'send sms copy', 'send sms', 'sms link'].includes(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "SMS ಕಳುಹಿಸಲಾಗಿದೆ! +91 98450 XXXXX ಗೆ 1-ಟ್ಯಾಪ್ ಪಾವತಿ ಲಿಂಕ್ ತಲುಪಿದೆ. ₹4,650 ಪಾವತಿ ಮಾಡಲು ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ."
        : selectedLang.code === 'hi-IN'
          ? "SMS भेज दिया गया! +91 98450 XXXXX पर 1-Tap लिंक पहुँच गया है। ₹4,650 का भुगतान करने के लिए लिंक पर क्लिक करें।"
          : "SMS sent! The 1-Tap payment link has been delivered to +91 98450 XXXXX. Click it to pay ₹4,650 in one tap using any UPI app.";
      intent = 'SMS_DISPATCHED';
      action = 'SMS payment link dispatched to customer number';
      chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Talk to Manager'];
    } else if (['yes, speaking.', 'yes, speaking', 'yes speaking', 'yes, complete order', 'yes i am', 'confirm order', 'ಹೌದು, ನಾನೇ', 'हाँ, बोल रहा हूँ'].includes(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಧನ್ಯವಾದಗಳು ರಾಜೇಶ್! ನಿಮ್ಮ HDFC ಕಾರ್ಡ್ E_504 ಟೈಮ್ಔಟ್ ಕಾರಣ ವಿಫಲವಾಗಿದೆ. ₹4,650 ಕಡಿತಗೊಂಡಿಲ್ಲ. WhatsApp ಅಥವಾ SMS ಮೂಲಕ 1-ಟ್ಯಾಪ್ UPI ಲಿಂಕ್ ಕಳುಹಿಸಲೆ?"
        : selectedLang.code === 'hi-IN'
          ? "धन्यवाद राजेश! आपका HDFC कार्ड E_504 टाइमआउट से फेल हुआ। ₹4,650 कट नहीं हुआ। WhatsApp या SMS पर 1-Tap UPI लिंक भेजूँ?"
          : "Thank you Rajesh! Your HDFC card failed due to gateway timeout (E_504). No amount was deducted. Shall I send the 1-Tap UPI payment link via WhatsApp or SMS?";
      intent = 'IDENTITY_CONFIRMED';
      sentiment = 'Cooperative';
      action = 'Identity verified, payment link dispatch ready';
      chips = ['Send on WhatsApp', 'Send via SMS', 'I want to cancel', 'Talk to Manager'];
    } else if (['talk to manager', 'talk to human', 'connect to human', '✓ connected with manager', 'i need a human'].includes(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಖಂಡಿತ! ನಿಮ್ಮ ಆರ್ಡರ್ ವಿವರಗಳೊಂದಿಗೆ ಹಿರಿಯ ಮ್ಯಾನೇಜರ್ ವಿಕ್ರಮ್ ಅವರಿಗೆ ಕಾಲ್ ಟ್ರಾನ್ಸ್ಫರ್ ಮಾಡಲಾಗುತ್ತಿದೆ. 5 ಸೆಕೆಂಡ್ ತಡೆಯಿರಿ."
        : selectedLang.code === 'hi-IN'
          ? "बिल्कुल! आपका पूरा केस Senior Manager Vikram को transfer किया जा रहा है। 5 सेकंड रुकें।"
          : "Certainly! Transferring your case to Senior Manager Vikram at Razorpay Support. He has your full order context. Please hold for 5 seconds.";
      intent = 'HUMAN_ESCALATION';
      action = 'Live call transferred to Senior Manager Vikram';
      chips = ['✓ Connected with Manager', 'Cancel Transfer'];
    } else if (['i want to cancel', 'cancel order', 'cancel this order', 'yes cancel', 'confirm cancel'].includes(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಅರ್ಥಮಾಡಿಕೊಂಡೆ. ರದ್ದು ಮಾಡುವ ಮೊದಲು: ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ, ವಿತರಣೆ ವಿಳಂಬವೇ, ಅಥವಾ ಬೇರೆ ಕಾರಣವೇ?"
        : selectedLang.code === 'hi-IN'
          ? "समझ गया। रद्द करने से पहले — क्या कारण है: कीमत ज़्यादा है, देरी है, या कोई और बात?"
          : "I understand. Before processing cancellation — is it because of the price, delivery timing, or something else? I may be able to help resolve it.";
      intent = 'CANCEL_INSPECTION';
      sentiment = 'Objecting';
      action = 'Cancellation motive probe initiated';
      chips = ['Price is too high', 'Delivery delay', 'Ordered by mistake', 'No reason, just cancel'];
    } else if (['paid via google pay', 'paid via phonepe', 'paid via paytm', 'paid via phonepay', 'paid via upi', '✓ order complete', 'payment done'].includes(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಅದ್ಭುತ! ₹4,650 ಪಾವತಿ ದೃಢೀಕೃತವಾಗಿದೆ. ಆರ್ಡರ್ #RZP-8921 ಡಿಸ್ಪ್ಯಾಚ್‌ಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ. WhatsApp ನಲ್ಲಿ ರಶೀದಿ ಇದೆ. ಧನ್ಯವಾದಗಳು!"
        : selectedLang.code === 'hi-IN'
          ? "शानदार! ₹4,650 का भुगतान confirm हो गया। Order #RZP-8921 dispatch के लिए तैयार है। WhatsApp पर invoice भेज दी गई है!"
          : "Excellent Rajesh! Payment of ₹4,650 confirmed. Order #RZP-8921 is approved for Priority Express Dispatch. Tax invoice sent to WhatsApp. Enjoy your product!";
      intent = 'PAYMENT_CONFIRMED';
      sentiment = 'Satisfied';
      action = 'Payment confirmed, order dispatched, invoice generated';
      chips = ['✓ Order Complete', 'Download Tax Invoice'];
    } else if (['price is too high', 'too expensive', 'price objection', '✓ accept ₹4,418 offer'].includes(t)) {
      reply = t.includes('accept')
        ? (selectedLang.code === 'hi-IN' ? "शानदार! SAVE232 discount apply हो गया। नई कुल रकम: ₹4,418। WhatsApp पर UPI link भेज रहा हूँ।" : "Great choice! Code SAVE232 applied — your new total is ₹4,418. Sending the updated UPI link to WhatsApp now!")
        : (selectedLang.code === 'hi-IN' ? "मैं आपके लिए 5% loyalty discount (SAVE232) apply करके ₹4,418 कर सकता हूँ। स्वीकार करेंगे?" : "I can apply an authorized 5% loyalty discount (SAVE232), bringing your total to ₹4,418. Would you like to accept this offer?");
      intent = 'PRICE_RETENTION';
      action = 'Applied 5% retention discount SAVE232';
      chips = ['✓ Accept ₹4,418 Offer', 'Send on WhatsApp', 'Still Cancel Order'];
    } else if (['delivery delay', 'late delivery', 'priority dispatch'].includes(t)) {
      reply = selectedLang.code === 'hi-IN'
        ? "समझ गया! मैंने आपका Order Priority Express में upgrade कर दिया — 24 घंटे में delivery। WhatsApp पर payment link भेजूँ?"
        : "Understood! I have upgraded Order #RZP-8921 to 24-Hour Priority Express Dispatch at no extra cost. Shall I send the payment link via WhatsApp?";
      intent = 'DELIVERY_EXPEDITE';
      action = 'Upgraded to Priority Express Dispatch';
      chips = ['Send on WhatsApp', 'Send via SMS', 'Talk to Manager'];
    }
    // ── END CHIP EXACT MATCHES ────────────────────────────────────────────────
    else

    // 1. GREETING & IDENTITY INQUIRY
    if (/^(hello|hi|hey|namaste|namaskara|vanakkam|who is this|why are you calling|who are you|ಯಾರು ನೀವು|ಯಾಕೆ ಕರೆ ಮಾಡಿದ್ದೀರಿ|आप कौन हैं|कॉल क्यों किया)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ನಮಸ್ಕಾರ ರಾಜೇಶ್! ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650) HDFC ಬ್ಯಾಂಕ್ ಟೈಮ್ಔಟ್ ಕಾರಣ ಪೆಂಡಿಂಗ್ ಇದೆ. ನೀವು ಇದನ್ನು 1-ಟ್ಯಾಪ್ UPI ಮೂಲಕ ಪೂರ್ಣಗೊಳಿಸಲು ಬಯಸುತ್ತೀರಾ?"
        : selectedLang.code === 'hi-IN'
          ? "नमस्ते राजेश जी! मैं Razorpay Assistant बोल रहा हूँ। आपका आर्डर #RZP-8921 HDFC बैंक टाइमआउट के कारण पेंडिंग है। क्या आप इसे पूरा करना चाहते हैं?"
          : "Hello Rajesh! I am calling from Razorpay Support regarding your pending Order #RZP-8921 (Apple AirPods Pro - ₹4,650) which faced an HDFC bank timeout. Would you like to complete this order via 1-Tap UPI?";
      intent = 'GREETING_AND_CONTEXT';
      chips = ['Yes, Complete Order', 'Send SMS Copy', 'I want to cancel', 'Talk to Human'];
    }
    // 2. IDENTITY CONFIRMED ("Yes, speaking")
    else if (/(yes|speaking|yes speaking|correct|right|ಹೌದು|ನಾನೇ|हाँ|बोल रहा)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ HDFC ಕಾರ್ಡ್ ವಹಿವಾಟು ಟೈಮ್ಔಟ್ (E_504) ಕಾರಣ ವಿಫಲವಾಗಿದೆ. ಪಾವತಿ ಲಿಂಕ್ WhatsApp ಅಥವಾ SMS ಮೂಲಕ ಕಳುಹಿಸಲೆ?"
        : selectedLang.code === 'hi-IN'
          ? "धन्यवाद। आपका HDFC कार्ड पेमेंट टाइमआउट के कारण रुक गया था। क्या मैं पेमेंट लिंक WhatsApp या SMS पर भेज दूँ?"
          : "Thank you. I see your HDFC card payment timed out (E_504). Would you prefer completing this via 1-Tap WhatsApp UPI or SMS link?";
      intent = 'IDENTITY_CONFIRMED';
      chips = ['Send on WhatsApp', 'Send via SMS', 'I want to cancel', 'Check Refund'];
    }
    // 3. WRONG NUMBER / DND
    else if (/(wrong number|not rajesh|stop calling|remove my number|don't call|ತಪ್ಪು ಸಂಖ್ಯೆ|गलत नंबर|தவறான எண்)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಕ್ಷಮಿಸಿ! ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು DND ಪಟ್ಟಿಯಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಇನ್ನು ಯಾವುದೇ ಕರೆಗಳು ಬರುವುದಿಲ್ಲ."
        : selectedLang.code === 'hi-IN'
          ? "माफ़ी चाहते हैं। आपका नंबर DND लिस्ट में जोड़ दिया गया है, आगे कोई कॉल नहीं आएगी।"
          : "My apologies! Your number has been registered on our DND list. All automated outreach is halted immediately.";
      intent = 'DND_STOPPING_RULE';
      sentiment = 'Identity Refusal (DND)';
      action = 'DPDP / DNC Rule Triggered: Suppressed further retries';
      chips = ['Done, Thank You'];
    }
    // 4. HUMAN ESCALATION
    else if (/(human|manager|senior|officer|supervisor|real person|customer care|ವಿಕ್ರಮ್|ಮ್ಯಾನೇಜರ್|इंसान|अधिकारी)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಖಂಡಿತ ರಾಜೇಶ್ ಅವರೇ. ನಿಮ್ಮ ಆರ್ಡರ್ ವಿವರಗಳೊಂದಿಗೆ ಹಿರಿಯ ಸಪೋರ್ಟ್ ಮ್ಯಾನೇಜರ್ ಅವರಿಗೆ ಲೈವ್ ಕಾಲ್ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು 5 ಸೆಕೆಂಡುಗಳು ಹೋಲ್ಡ್‌ನಲ್ಲಿರಿ."
        : selectedLang.code === 'hi-IN'
          ? "जी बिल्कुल राजेश जी। आपका पूरा केस विवरण तैयार करके वरिष्ठ अधिकारी को कॉल ट्रांसफर की जा रही है।"
          : "Certainly Rajesh. I am transferring your case directly to Senior Manager Vikram at the Razorpay Support Desk. Please hold for 5 seconds.";
      intent = 'HUMAN_ESCALATION';
      action = 'Live human call handoff executed to Senior Desk';
      chips = ['✓ Connected with Manager', 'Cancel Transfer'];
    }
    // 5. CANCELLATION REQUEST -> MOTIVE PROBING
    else if (/(cancel|dont want|don't want|stop|not interested|cancel order|ಕ್ಯಾನ್ಸಲ್|ರದ್ದು|ಬೇಡ|रद्द)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಅರ್ಥಮಾಡಿಕೊಂಡೆ. ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸುವ ಮುನ್ನ ತಿಳಿಸಬಹುದೇ: ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ ಅಥವಾ ವಿತರಣೆ ವಿಳಂಬವೇ?"
        : selectedLang.code === 'hi-IN'
          ? "समझ गया। क्या मैं जान सकता हूँ कि क्या कारण है: कीमत ज़्यादा है या डिलीवरी में देरी?"
          : "I understand. Before I process cancellation for Order #RZP-8921, may I ask the reason: is it delivery delay, price concerns, or something else?";
      intent = 'CANCEL_INSPECTION';
      chips = ['Price is too high', 'Delivery delay', 'Ordered by mistake', 'Confirm Cancel'];
    }
    // 6. DELIVERY DELAY OBJECTION
    else if (/(delay|slow|delivery|late|parcel|taking too long|not arrived|when will i get|ತಡ|ವಿಳಂಬ|देरी)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡೆ! ನಾನು ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು 24 ಗಂಟೆಗಳಲ್ಲಿ ತಲುಪಿಸಲು 'ಪ್ರಯಾರಿಟಿ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಡಿಸ್ಪ್ಯಾಚ್' ಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿದ್ದೇನೆ. ಪಾವತಿ ಲಿಂಕ್ WhatsApp ಮೂಲಕ ಕಳುಹಿಸಲೆ?"
        : selectedLang.code === 'hi-IN'
          ? "मैं समझ गया! मैंने आपका आर्डर 24 घंटे में डिलीवरी के लिए 'Priority Express' में अपग्रेड कर दिया है। क्या पेमेंट लिंक WhatsApp पर भेज दूँ?"
          : "I understand! I have upgraded your Order #RZP-8921 to 24-Hour Priority Express Dispatch. Shall I send the 1-Tap payment link via WhatsApp?";
      intent = 'DELIVERY_EXPEDITE';
      action = 'Upgraded shipment to 24-hour Priority Express Dispatch';
      chips = ['Send on WhatsApp', 'Send via SMS', 'Talk to Manager'];
    }
    // 7. PRICE OBJECTION / DISCOUNT
    else if (/(price|expensive|high|discount|offer|cheap|cost|ದುಬಾರಿ|ಹೆಚ್ಚು|महंगा|ज्यादा)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ನಿಮ್ಮ ಗ್ರಾಹಕ ನಿಷ್ಠೆಗಾಗಿ ನಾನು ತಕ್ಷಣ 5% ರಿಯಾಯಿತಿ (SAVE232) ಅನ್ವಯಿಸಿ ಒಟ್ಟು ಮೊತ್ತವನ್ನು ₹4,418 ಗೆ ಇಳಿಸಬಲ್ಲೆ. ಈ ಆಫರ್ ಸ್ವೀಕರಿಸಲು ಬಯಸುತ್ತೀರಾ?"
        : selectedLang.code === 'hi-IN'
          ? "मैं आपके लिए instant 5% retention discount (SAVE232) अप्लाई करके कुल रकम ₹4,418 कर सकता हूँ। क्या आप इसे स्वीकार करेंगे?"
          : "I can apply an authorized 5% loyalty discount (SAVE232), bringing your total to ₹4,418. Would you like to accept this offer?";
      intent = 'PRICE_RETENTION';
      action = 'Applied dynamic 5% retention incentive';
      chips = ['✓ Accept ₹4,418 Offer', 'Still Cancel Order', 'Talk to Manager'];
    }
    // 8. SEND SMS REQUEST
    else if (/(sms|text|message|send sms|text me|ಎಸ್ಎಂಎಸ್|एसएमएस)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ದೃಢೀಕೃತ: ನಿಮ್ಮ ಮೊಬೈಲ್ +91 98450 XXXXX ಗೆ 1-ಟ್ಯಾಪ್ SMS ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ. ನೀವು Google Pay ಅಥವಾ PhonePe ಮೂಲಕ ಪಾವತಿಸಬಹುದೇ?"
        : selectedLang.code === 'hi-IN'
          ? "सत्यापित: आपके नंबर +91 98450 XXXXX पर 1-Tap SMS लिंक भेज दिया गया है। क्या आप Google Pay या PhonePe से पूरा करेंगे?"
          : "Verified: The 1-Tap SMS payment link has been dispatched to +91 98450 XXXXX. Would you prefer paying via Google Pay or PhonePe?";
      intent = 'SMS_DISPATCHED';
      chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Talk to Manager'];
    }
    // 9. WHATSAPP / UPI REQUEST
    else if (/(whatsapp|upi|gpay|phonepe|paytm|link|send link|ವಾಟ್ಸಾಪ್|ಯುಪಿಐ|व्हाट्सएप|यूपीआई)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ನಿಮ್ಮ WhatsApp ನಲ್ಲಿ ಅಧಿಕೃತ Razorpay 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀವು Google Pay ಅಥವಾ PhonePe ಬಳಸಲು ಬಯಸುತ್ತೀರಾ?"
        : selectedLang.code === 'hi-IN'
          ? "आपके WhatsApp पर Razorpay 1-Tap UPI लिंक भेज दिया गया है। आप Google Pay या PhonePe से भुगतान कर सकते हैं।"
          : "Your verified 1-Tap UPI link is now active in WhatsApp. Would you like to complete payment using Google Pay, PhonePe, or Paytm?";
      intent = 'WHATSAPP_LINK_ACTIVE';
      setShowWhatsAppPopup(true);
      chips = ['Paid via Google Pay', 'Paid via PhonePe', 'Talk to Manager'];
    }
    // 10. PAYMENT COMPLETED / ALREADY PAID
    else if (/(paid|done|completed|already paid|i paid|sent money|ಪಾವತಿಸಿದೆ|ಮಾಡಿದೆ|भुगतान किया|செலுத்தப்பட்டது)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ಅದ್ಭುತ ರಾಜೇಶ್ ಅವರೇ! ನಿಮ್ಮ ₹4,650 ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಆರ್ಡರ್ #RZP-8921 ರವಾನೆಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ. ರಶೀದಿ WhatsApp ನಲ್ಲಿದೆ. ಧನ್ಯವಾದಗಳು!"
        : selectedLang.code === 'hi-IN'
          ? "शानदार राजेश जी! आपका ₹4,650 का भुगतान सत्यापित हो गया है। आर्डर #RZP-8921 डिस्पेच के लिए तैयार है। रसीद WhatsApp पर भेज दी गई है।"
          : "Awesome Rajesh! Your payment of ₹4,650 is confirmed. Order #RZP-8921 is approved for priority warehouse dispatch. Tax invoice generated on WhatsApp. Thank you!";
      intent = 'PAYMENT_CONFIRMED';
      action = 'Payment confirmed, invoice generated, and order dispatched';
      chips = ['✓ Order Complete', 'Download Tax Invoice'];
    }
    // 11. DOUBLE-DEBIT / REFUND STATUS CHECK
    else if (/(refund|deducted|money cut|cut money|double debit|రిఫండ్|ರಿಫಂಡ್|रिफंड)/i.test(t)) {
      reply = selectedLang.code === 'kn-IN'
        ? "ದೃಢೀಕೃತ ವರದಿ: NPCI UTR #904288192014 ಮೂಲಕ ₹4,650 ಮೊತ್ತವನ್ನು 2.18 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರಿಫಂಡ್ ಮಾಡಲಾಗಿದೆ. ರಶೀದಿ WhatsApp ನಲ್ಲಿದೆ."
        : selectedLang.code === 'hi-IN'
          ? "सत्यापित रिपोर्ट: NPCI UTR #904288192014 के तहत ₹4,650 का रिफंड 2.18 सेकंड में प्रोसेस कर दिया गया है।"
          : "Audit Verified: NPCI UTR #904288192014 confirms ₹4,650 reversal executed via T+0 instant rail in 2.18s.";
      intent = 'T0_REFUND_EXECUTED';
      action = 'Audit confirmed instant refund status';
      chips = ['✓ View NPCI Receipt', 'Re-order Product'];
    }
    // DEFAULT INQUIRY
    else {
      reply = selectedLang.code === 'kn-IN'
        ? "ಖಂಡಿತ, ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650) ಸಂಬಂಧಿಸಿದಂತೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
        : selectedLang.code === 'hi-IN'
          ? "जी, मैं आपके Order #RZP-8921 (₹4,650) के संबंध में आपकी किस प्रकार सहायता कर सकता हूँ?"
          : "I am assisting you regarding Order #RZP-8921 (Apple AirPods Pro - ₹4,650). Would you like to complete payment, check refund, or speak with an executive?";
      intent = 'GENERAL_QUERY';
      chips = ['Send on WhatsApp', 'Send via SMS', 'I want to cancel', 'Talk to Manager'];
    }

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
    <div className="min-h-screen bg-slate-950 text-gray-100 p-8 font-sans">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Phone size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              Voice Recovery Assistant
              <span className="ml-3 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                Order #RZP-8921
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Vernacular conversational AI for payment failure resolution and objection handling.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-gray-800 p-1.5 rounded-xl">
          <Languages size={16} className="text-gray-400 ml-2" />
          <span className="text-xs text-gray-400 font-medium mr-1">Dialect:</span>
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
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

      {/* Top Test Scenarios Bar */}
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
            className="px-3 py-1 bg-slate-800 border border-gray-700 hover:bg-slate-700 text-gray-300 text-xs rounded-lg transition font-medium flex items-center"
          >
            <ShieldAlert size={12} className="mr-1.5" /> 4. Wrong Number / DND
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-gray-800 rounded-2xl p-6 flex flex-col h-[560px] relative shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-sm font-semibold text-white">Live Call: Razorpay Assistant ➔ Rajesh Kumar</span>
              <span className="text-xs text-gray-500 font-mono">({formatCallTime(callDuration)})</span>
            </div>
            <button
              onClick={() => handleLanguageChange(selectedLang)}
              className="text-xs text-gray-400 hover:text-white flex items-center transition"
            >
              <RotateCcw size={12} className="mr-1" /> Reset Call
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {conversationHistory.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 text-[11px] text-gray-500 mb-1">
                  <span>{msg.role === 'customer' ? 'Customer' : 'Razorpay Assistant'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'customer'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-gray-700 text-gray-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'agent' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1.5">
                    {msg.quickReplies.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTurnSubmit(chip)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-blue-300 hover:text-white rounded-lg text-xs transition flex items-center"
                      >
                        <ChevronRight size={12} className="mr-1 text-blue-400" /> {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTurnSubmit(customText); }}
                placeholder={`Type your response in ${selectedLang.name} (e.g. "hello", "why are you calling", "I already paid")...`}
                className="flex-1 bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleTurnSubmit(customText)}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
              >
                <Send size={16} />
              </button>
            </div>

            <button
              onClick={callState === 'LISTENING' ? finishSpeakingAndAnalyze : startListening}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center space-x-2 ${
                callState === 'LISTENING'
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300'
              }`}
            >
              {callState === 'LISTENING' ? (
                <>
                  <MicOff size={18} />
                  <span>Listening... Tap to Complete</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>TAP TO SPEAK (Microphone)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center">
                <ShieldCheck size={18} className="text-emerald-400 mr-2" />
                Live Telecaller Audit
              </h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Verified ✓
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-gray-800">
                <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Detected Intent</p>
                <p className="text-white font-bold text-sm">{parsedIntent.intent}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-gray-800">
                <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Customer Sentiment</p>
                <p className="text-emerald-400 font-semibold">{parsedIntent.sentiment}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-gray-800">
                <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Target Order</p>
                <p className="text-white font-mono">#RZP-8921 (₹4,650)</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-gray-800">
                <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">PolicyGuard Action</p>
                <p className="text-blue-400 font-medium">{parsedIntent.action}</p>
              </div>
            </div>
          </div>

          {showWhatsAppPopup && (
            <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
              <p className="text-xs font-bold text-emerald-300 flex items-center mb-1">
                <Smartphone size={14} className="mr-1.5" /> WhatsApp 1-Tap Link
              </p>
              <div className="bg-slate-950 p-2 rounded-lg text-emerald-400 font-mono text-[10px] truncate">
                https://rzp.io/i/RR-9042-airpods
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
