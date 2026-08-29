'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Activity, ShieldCheck, Languages, ArrowRight, Zap, Play, Send, 
  Volume2, VolumeX, Phone, PhoneOff, MessageSquare, CheckCircle, XCircle, Clock, 
  Sparkles, Gauge, Trash2, CheckCircle2, User, Bot, RotateCcw
} from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  samplePhrase: string;
  initialGreeting: string;
  ttsPromiseResponse: string;
  ttsCancelResponse: string;
}

interface MessageTurn {
  id: string;
  role: 'customer' | 'agent';
  text: string;
  timestamp: string;
  lang: string;
  intent?: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { 
    code: 'en-IN', 
    name: 'English', 
    nativeName: 'English', 
    samplePhrase: 'My card failed. Can you send a 1-tap UPI payment link on WhatsApp?',
    initialGreeting: 'Hello! This is an automated call from Razorpay. How can we assist you with completing your transaction today?',
    ttsPromiseResponse: 'Thank you! We have scheduled a 1-tap UPI payment link directly to your WhatsApp.',
    ttsCancelResponse: 'Understood. We have cancelled your order as requested and stopped all automated outreach.'
  },
  { 
    code: 'kn-IN', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    samplePhrase: 'ನನ್ನ ಕಾರ್ಡ್ ವರ್ಕ್ ಆಗ್ತಿಲ್ಲ, ನಾಳೆ ಗೂಗಲ್ ಪೇ ಮಾಡ್ತೀನಿ',
    initialGreeting: 'ನಮಸ್ಕಾರ! Razorpay ನಿಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇವೆ. ನಿಮ್ಮ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಲು ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    ttsPromiseResponse: 'ಧನ್ಯವಾದಗಳು! ನಾಳೆ ಬೆಳಗ್ಗೆ ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಯುಪಿಐ ಪೇಮೆಂಟ್ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ.',
    ttsCancelResponse: 'ಖಂಡಿತ, ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಈ ಆರ್ಡರ್ ಅನ್ನು ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲಾಗಿದೆ. ನಾವು ಇನ್ನು ಮುಂದೆ ಕರೆ ಮಾಡುವುದಿಲ್ಲ.'
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिंदी', 
    samplePhrase: 'मेरा कार्ड काम नहीं कर रहा, मैं कल सुबह यूपीआई से पेमेंट कर दूंगा',
    initialGreeting: 'नमस्ते! Razorpay से कॉल कर रहे हैं। आपके पेमेंट को पूरा करने में हम आपकी किस प्रकार सहायता कर सकते हैं?',
    ttsPromiseResponse: 'धन्यवाद! हम कल सुबह आपके व्हाट्सएप पर 1-टैप यूपीआई पेमेंट लिंक भेज देंगे।',
    ttsCancelResponse: 'जी बिल्कुल, आपके अनुरोध के अनुसार हमने आपका ऑर्डर रद्द कर दिया है। हम आगे से संपर्क नहीं करेंगे।'
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    samplePhrase: 'கார்டு வேலை செய்யவில்லை, நாளைக்கு ஜிபே மூலமா பணம் கட்டுகிறேன்',
    initialGreeting: 'வணக்கம்! Razorpay இலிருந்து அழைக்கிறோம். உங்கள் கட்டணத்தை முடிக்க நாங்கள் எவ்வாறு உதவலாம்?',
    ttsPromiseResponse: 'நன்றி! நாளை காலை உங்கள் வாட்ஸ்அப்பில் யுபிಐ கட்டண இணைப்பை அனுப்புகிறோம்.',
    ttsCancelResponse: 'சரி, உங்கள் கோரிக்கையின்படி ஆர்டர் ரத்து செய்யப்பட்டது.'
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    samplePhrase: 'కార్డు పని చేయడం లేదు, రేపు పొద్దున ఫోన్‌పే ద్వారా చెల్లిస్తాను',
    initialGreeting: 'నమస్కారం! Razorpay నుండి కాల్ చేస్తున్నాము. మీ చెల్లింపు పూర్తి చేయడానికి మేము ఎలా సహాయపడగలము?',
    ttsPromiseResponse: 'ధన్యవాదాలు! రేపు ఉదయం మీకు వాట్సాప్‌లో యూపీఐ పేమెంట్ లింక్ పంపుతాము.',
    ttsCancelResponse: 'సరే, మీ అభ్యర్థన మేరకు ఆర్డర్ రద్దు చేయబడింది.'
  },
  { 
    code: 'ml-IN', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    samplePhrase: 'കാർഡ് വർക്കാവുന്നില്ല, നാളെ രാവിലെ ഗൂഗിൾ പേ വഴി തരാം',
    initialGreeting: 'നമസ്കാരം! Razorpay-ൽ നിന്നാണ് വിളിക്കുന്നത്. നിങ്ങളുടെ പേയ്‌മെന്റ് പൂർത്തിയാക്കാൻ ഞങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാനാകും?',
    ttsPromiseResponse: 'നന്ദി! നാളെ രാവിലെ നിങ്ങളുടെ വാട്ട്‌സ്ആപ്പിലേക്ക് യുപിഐ പേയ്‌മെന്റ് ലിങ്ക് അയയ്ക്കാം.',
    ttsCancelResponse: 'ശരി, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രകാരം ഓർഡർ റദ്ദാക്കി.'
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

  // Step 1: Start User Speaking (Calm, no rush)
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

    // Append Customer message to history
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

  // Step 3: Handle text submit
  const handleCustomTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || callState !== 'IDLE') return;

    const textToProcess = customText.trim();
    setCustomText("");

    const customerMsg: MessageTurn = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      text: textToProcess,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    };

    const updatedHistory = [...conversationHistory, customerMsg];
    setConversationHistory(updatedHistory);

    processTurn(textToProcess, updatedHistory);
  };

  // Step 4: Sample Prompt trigger
  const handleSamplePromptClick = () => {
    if (callState !== 'IDLE') return;

    const sample = selectedLang.samplePhrase;
    const customerMsg: MessageTurn = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      text: sample,
      timestamp: formatCallTime(callDuration),
      lang: selectedLang.name
    };

    const updatedHistory = [...conversationHistory, customerMsg];
    setConversationHistory(updatedHistory);
    processTurn(sample, updatedHistory);
  };

  // Step 5: Multi-Turn Intent & Sequential Response Generation
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
        console.warn("Backend offline, using local engine.");
      }

      // Exact client-side regex engine (Eliminates false substring cancellations!)
      if (!intentData || intentData.intent === "UNKNOWN" || !intentData.intent) {
        const t = text.toLowerCase().trim();

        // 1. Greetings
        if (/\b(hi|hello|hey|how are you|good morning|good evening|namaste|vanakkam|namaskara)\b/i.test(t)) {
          intentData = {
            intent: "GREETING",
            sentiment: "Neutral",
            confidence_score: 98,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'kn-IN' 
              ? "ನಮಸ್ಕಾರ! ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ. ನಿಮ್ಮ Razorpay ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
              : selectedLang.code === 'hi-IN'
                ? "नमस्ते! मैं ठीक हूँ, धन्यवाद। आपकी Razorpay पेमेंट पूरा करने में हम आपकी कैसे मदद कर सकते हैं?"
                : "Hello! I am doing well, thank you. I am calling from Razorpay regarding your recent transaction. How can I assist you today?",
            recommended_action: "Greet customer and open recovery options"
          };
        }
        // 2. Technical issues & Card failures (Must NEVER cancel order!)
        else if (/\b(why.*card|card.*not working|card failed|card decline|declined|otp|server down|transaction failed|bank timeout|failed)\b/i.test(t)) {
          intentData = {
            intent: "TECHNICAL_ISSUE",
            sentiment: "Technical Complaint",
            confidence_score: 97,
            willingness_to_pay: true,
            payment_method: "UPI (Google Pay / PhonePe)",
            ai_spoken_reply: selectedLang.code === 'kn-IN'
              ? "ಬ್ಯಾಂಕ್ ಸರ್ವರ್ ಸಮಸ್ಯೆಯಿಂದ ಕಾರ್ಡ್ ಪಾವತಿ ವಿಫಲವಾಗಿರಬಹುದು. ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲೆ?"
              : selectedLang.code === 'hi-IN'
                ? "बैंक सर्वर डाउन होने के कारण कार्ड डिक्लाइन हो सकता है। क्या मैं आपके व्हाट्सएप पर 1-टैप यूपीआई लिंक भेज दूँ?"
                : "Card declines usually happen due to temporary bank server downtime or OTP limits. Would you like me to send a fast 1-tap UPI link to your WhatsApp instead?",
            recommended_action: "Provide downtime diagnostics and offer instant 1-Tap UPI switch"
          };
        }
        // 3. Price / Discounts / Cheap queries
        else if (/\b(cheap|price|discount|offer|coupon|cost|cheaper|rates)\b/i.test(t)) {
          intentData = {
            intent: "PRICE_INQUIRY",
            sentiment: "Price Sensitive",
            confidence_score: 95,
            willingness_to_pay: true,
            payment_method: "UPI",
            ai_spoken_reply: "We offer instant cashback and bank discount offers when paying via 1-Tap UPI. Would you like me to send your discount payment link on WhatsApp?",
            recommended_action: "Apply dynamic UPI discount incentive and send recovery link"
          };
        }
        // 4. Refund requests
        else if (/\b(refund|money deducted|paisa cut|deducted|ರೀಫಂಡ್|ಕಟ್ ಆಗಿದೆ|रिफंड)\b/i.test(t)) {
          intentData = {
            intent: "REFUND_REQUEST",
            sentiment: "Frustrated / Refund",
            confidence_score: 97,
            willingness_to_pay: false,
            ai_spoken_reply: selectedLang.code === 'en-IN' 
              ? "Don't worry! We are issuing an instant T+0 reversal to your bank account right now. Your UTR has been sent to WhatsApp." 
              : selectedLang.code === 'kn-IN'
                ? "ಚಿಂತೆ ಮಾಡಬೇಡಿ! ನಿಮ್ಮ ಹಣವನ್ನು ತಕ್ಷಣವೇ 2 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರಿಫಂಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ. UTR ಸಂಖ್ಯೆಯನ್ನು ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ."
                : "चिंता न करें! आपका रिफंड तुरंत आपके बैंक खाते में भेजा जा रहा है।",
            recommended_action: "Initiate T+0 Instant Refund via Razorpay API"
          };
        }
        // 5. Explicit Cancellations ONLY (Strict whole-phrase matching)
        else if (/\b(cancel my order|cancel order|cancel it|dont want|don't want|not interested|stop calling|refuse|ಬೇಡ|ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ|nahi chahiye|radd karo)\b/i.test(t)) {
          intentData = {
            intent: "OPT_OUT",
            sentiment: "Refusal / Cancellation",
            confidence_score: 98,
            willingness_to_pay: false,
            ai_spoken_reply: selectedLang.ttsCancelResponse,
            recommended_action: "Halt automated outreach immediately. Order cancelled per customer request."
          };
        }
        // 6. Alternative UPI method
        else if (/\b(upi|gpay|phonepe|paytm|link|whatsapp link|qr|google pay|ಯುಪಿಐ|ಜಿಪೇ|ಫೋನ್‌ಪೇ|यूपीआई)\b/i.test(t)) {
          intentData = {
            intent: "ALTERNATIVE_METHOD",
            sentiment: "Positive (Prefers UPI)",
            confidence_score: 96,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'en-IN'
              ? "Sure! We are sending an instant 1-tap UPI payment link directly to your WhatsApp right now."
              : selectedLang.code === 'kn-IN'
                ? "ಖಂಡಿತ! ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಇವಾಗ್ಲೇ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಪೇಮೆಂಟ್ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತಿದ್ದೇವೆ."
                : "जी बिल्कुल! हम आपके व्हाट्सएप पर तुरंत 1-टैप यूपीआई लिंक भेज रहे हैं।",
            recommended_action: "Generate instant 1-Tap UPI deep link via Razorpay"
          };
        }
        // 7. Promise to pay later
        else if (/\b(tomorrow|later|morning|evening|next week|will pay|pay tomorrow|ನಾಳೆ|ಮಾಡ್ತೀನಿ|kal|kar dunga)\b/i.test(t)) {
          intentData = {
            intent: "PROMISE_TO_PAY",
            sentiment: "Positive (Promise to Pay)",
            confidence_score: 97,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.ttsPromiseResponse,
            recommended_action: "Schedule 1-Tap UPI WhatsApp Payment Link for tomorrow"
          };
        }
        // 8. General conversational fallback
        else {
          intentData = {
            intent: "GENERAL_QUERY",
            sentiment: "Engaged Customer",
            confidence_score: 94,
            willingness_to_pay: true,
            ai_spoken_reply: selectedLang.code === 'en-IN'
              ? "Thank you for sharing that. I have noted your details and our team is assisting you with completing your transaction."
              : selectedLang.code === 'kn-IN'
                ? "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ನಾವು ಪರಿಶೀಲಿಸಿ ಸಹಾಯ ಮಾಡುತ್ತೇವೆ."
                : "धन्यवाद. हमने आपका अनुरोध नोट कर लिया है।",
            recommended_action: "Logged conversation and assigned priority recovery strategy"
          };
        }
      }

      const aiReplyText = intentData.ai_spoken_reply || selectedLang.ttsPromiseResponse;

      // Update structured state
      const isCancellation = intentData.intent === "OPT_OUT";
      setParsedIntent({
        intent: intentData.intent || "GENERAL_QUERY",
        language: selectedLang.name,
        sentiment: intentData.sentiment || "Positive",
        confidence: intentData.confidence_score || 96,
        willingness: isCancellation ? "Negative (Cancelled)" : "Positive (Engaged)",
        method: intentData.payment_method || (isCancellation ? "None" : "UPI (Google Pay / PhonePe)"),
        date: intentData.requested_date || (intentData.intent === "PROMISE_TO_PAY" ? "Tomorrow morning" : "Immediate"),
        action: intentData.recommended_action || "Autonomous Strategy Updated"
      });

      if (!isCancellation && intentData.intent !== 'REFUND_REQUEST' && intentData.intent !== 'GREETING') {
        setShowWhatsAppPopup(true);
      } else {
        setShowWhatsAppPopup(false);
      }

      // Add AI Agent Response to conversation history
      const agentMsg: MessageTurn = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: aiReplyText,
        timestamp: formatCallTime(callDuration),
        lang: selectedLang.name,
        intent: intentData.intent
      };

      setConversationHistory(prev => [...prev, agentMsg]);

      // Speak AI response aloud in selected language
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
              Sequential Multi-Turn Voice AI Agent
            </h1>
            <span className="flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              Live Call: {formatCallTime(callDuration)}
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            Calm, turn-by-turn phone conversation: Select your language and speak naturally.
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

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        
        {/* Left 7 Columns: Live Call Thread & Interaction Center */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-gray-800 flex flex-col shadow-2xl overflow-hidden min-h-[560px]">
          
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
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/40 text-xs font-sans max-h-[340px]">
            {conversationHistory.map((msg) => {
              const isCustomer = msg.role === 'customer';
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                >
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

            {/* Thinking / Analyzing Indicator */}
            {callState === 'ANALYZING' && (
              <div className="flex items-center space-x-2 text-blue-400 p-2 text-xs animate-pulse">
                <Activity size={16} className="animate-spin" />
                <span>AI Agent understanding your dialogue...</span>
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

              {/* One-Click Sample Prompt to Test */}
              <button
                onClick={handleSamplePromptClick}
                disabled={callState !== 'IDLE'}
                className="px-3 py-3 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-gray-800 rounded-xl text-xs font-semibold shrink-0 transition disabled:opacity-50"
                title="Simulate sample prompt"
              >
                <Play size={14} className="inline mr-1" /> Test Sample
              </button>
            </div>

            {/* Custom Text Typing Bar */}
            <form onSubmit={handleCustomTextSubmit} className="mt-3 flex space-x-2">
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
                  {parsedIntent?.intent || "Awaiting Dialogue"}
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
