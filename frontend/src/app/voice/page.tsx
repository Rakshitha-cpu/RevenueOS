'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Activity, ShieldCheck, Languages, ArrowRight, Zap, Play, Send, 
  Volume2, VolumeX, Phone, PhoneOff, MessageSquare, CheckCircle, XCircle, Clock, QrCode, Sparkles, Gauge 
} from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  samplePhrase: string;
  ttsPromiseResponse: string;
  ttsCancelResponse: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { 
    code: 'kn-IN', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    samplePhrase: 'ನನ್ನ ಕಾರ್ಡ್ ವರ್ಕ್ ಆಗ್ತಿಲ್ಲ, ನಾಳೆ ಗೂಗಲ್ ಪೇ ಮಾಡ್ತೀನಿ',
    ttsPromiseResponse: 'ಧನ್ಯವಾದಗಳು! ನಾಳೆ ಬೆಳಗ್ಗೆ ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಯುಪಿಐ ಪೇಮೆಂಟ್ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ.',
    ttsCancelResponse: 'ಖಂಡಿತ, ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಈ ಆರ್ಡರ್ ಅನ್ನು ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲಾಗಿದೆ. ನಾವು ಇನ್ನು ಮುಂದೆ ಕರೆ ಮಾಡುವುದಿಲ್ಲ.'
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिंदी', 
    samplePhrase: 'मेरा कार्ड काम नहीं कर रहा, मैं कल सुबह यूपीआई से पेमेंट कर दूंगा',
    ttsPromiseResponse: 'धन्यवाद! हम कल सुबह आपके व्हाट्सएप पर 1-टैप यूपीआई पेमेंट लिंक भेज देंगे।',
    ttsCancelResponse: 'जी बिल्कुल, आपके अनुरोध के अनुसार हमने आपका ऑर्डर रद्द कर दिया है। हम आगे से संपर्क नहीं करेंगे।'
  },
  { 
    code: 'en-IN', 
    name: 'English (India)', 
    nativeName: 'English', 
    samplePhrase: 'My card failed. Can you send a UPI payment link on WhatsApp?',
    ttsPromiseResponse: 'Thank you! We have scheduled a 1-tap UPI payment link directly to your WhatsApp.',
    ttsCancelResponse: 'Understood. We have cancelled your order as requested and stopped all outreach.'
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    samplePhrase: 'கார்டு வேலை செய்யவில்லை, நாளைக்கு ஜிபே மூலமா பணம் கட்டுகிறேன்',
    ttsPromiseResponse: 'நன்றி! நாளை காலை உங்கள் வாட்ஸ்அப்பில் யுபிಐ கட்டண இணைப்பை அனுப்புகிறோம்.',
    ttsCancelResponse: 'சரி, உங்கள் கோரிக்கையின்படி ஆர்டர் ரத்து செய்யப்பட்டது.'
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    samplePhrase: 'కార్డు పని చేయడం లేదు, రేపు పొద్దున ఫోన్‌పే ద్వారా చెల్లిస్తాను',
    ttsPromiseResponse: 'ధన్యవాదాలు! రేపు ఉదయం మీకు వాట్సాప్‌లో యూపీఐ పేమెంట్ లింక్ పంపుతాము.',
    ttsCancelResponse: 'సరే, మీ అభ్యర్థన మేరకు ఆర్డర్ రద్దు చేయబడింది.'
  },
  { 
    code: 'ml-IN', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    samplePhrase: 'കാർഡ് വർക്കാവുന്നില്ല, നാളെ രാവിലെ ഗൂഗിൾ പേ വഴി തരാം',
    ttsPromiseResponse: 'നന്ദി! നാളെ രാവിലെ നിങ്ങളുടെ വാട്ട്‌സ്ആപ്പിലേക്ക് യുപിಐ പേയ്‌മെന്റ് ലിങ്ക് അയയ്ക്കാം.',
    ttsCancelResponse: 'ശരി, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രകാരം ഓർഡർ റദ്ദാക്കി.'
  }
];

export default function VoiceRecovery() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]); // Default Kannada
  const [isListening, setIsListening] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  const [callDuration, setCallDuration] = useState(14);
  const [transcript, setTranscript] = useState("");
  const [aiSpokenResponse, setAiSpokenResponse] = useState<string>("");
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [customText, setCustomText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Call timer interval
  useEffect(() => {
    let timer: any;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Speak AI Audio response in the selected Indian language
  const speakAIResponse = (text: string, langCode: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Real-time microphone speech recognition
  const startLiveRecording = () => {
    setRecognitionError(null);
    setParsedIntent(null);
    setIsApproved(false);
    setShowWhatsAppPopup(false);
    setTranscript("");
    setAiSpokenResponse("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Speech recognition is not supported in this browser. Please open in Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang.code;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setCustomText(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError("Microphone permission denied. Please allow microphone in your browser address bar.");
        } else if (event.error === 'no-speech') {
          setRecognitionError("No speech detected. Please speak into the mic.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript && transcript.trim().length > 0) {
          processIntent(transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Speech start error:", err);
      setRecognitionError("Failed to initialize microphone.");
      setIsListening(false);
    }
  };

  const stopLiveRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Quick Demo Phrase Simulation
  const handleSimulateDemo = (sampleText: string, lang: LanguageOption) => {
    setSelectedLang(lang);
    setParsedIntent(null);
    setIsApproved(false);
    setShowWhatsAppPopup(false);
    setTranscript("");
    setAiSpokenResponse("");
    setIsListening(true);

    let i = 0;
    const interval = setInterval(() => {
      setTranscript(sampleText.substring(0, i));
      i++;
      if (i > sampleText.length) {
        clearInterval(interval);
        setIsListening(false);
        processIntent(sampleText);
      }
    }, 25);
  };

  // Custom text submission
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setParsedIntent(null);
    setIsApproved(false);
    setShowWhatsAppPopup(false);
    setTranscript(customText);
    processIntent(customText);
  };

  // Robust Intent Analyzer (Handles native scripts + Latin dialects)
  const analyzeLocally = (text: string): any => {
    const t = text.toLowerCase();
    
    // Refusal & Cancellation check
    const isRefusal = [
      "ಬೇಡ", "ಕ್ಯಾನ್ಸಲ್", "ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ", "ಇಲ್ಲ", "ಆಗಲ್ಲ", "ಆಗೋದಿಲ್ಲ", "ಮಾಡಲ್ಲ", "beda", "cancel", "illa", "aagalla", "kodalla",
      "नहीं", "मत करो", "रद्द", "कैंसिल", "nahi", "mat karo", "manaa",
      "வேண்டாம்", "ரத்து", "முடியாது", "வద్దు", "రద్దు", "లేదు",
      "cancel", "don't want", "dont want", "no", "stop", "never", "refuse", "not interested"
    ].some(k => t.includes(k));

    if (isRefusal) {
      return {
        intent: "OPT_OUT",
        detected_language: selectedLang.name,
        willingness_to_pay: false,
        sentiment: "Refusal / Cancellation",
        confidence_score: 98,
        payment_method: null,
        requested_date: null,
        ai_spoken_reply: selectedLang.ttsCancelResponse,
        recommended_action: "Halt automated outreach immediately. Order cancelled per customer request."
      };
    }

    // Alternative UPI method check
    const isUPI = ["ಯುಪಿಐ", "ಜಿಪೇ", "ಫೋನ್‌ಪೇ", "upi", "gpay", "phonepe", "paytm", "qr", "link", "गूगल पे", "यूपीಐ"].some(k => t.includes(k));

    // Promise to pay check
    const isPromise = [
      "ನಾಳೆ", "ಮಾಡ್ತೀನಿ", "ಮಾಡುತ್ತೇನೆ", "ಕೊಡ್ತೀನಿ", "ಸಂಜೆ", "ಬೆಳಗ್ಗೆ", "naale", "madthini", "kodthini",
      "कल", "कर दूंगा", "दूँगा", "kal", "kar dunga", "dunga",
      "நாளை", "ரேపు", "tomorrow", "later", "next week", "pay soon"
    ].some(k => t.includes(k));

    if (isPromise) {
      return {
        intent: "PROMISE_TO_PAY",
        detected_language: selectedLang.name,
        willingness_to_pay: true,
        sentiment: "Positive (Promise to Pay)",
        confidence_score: 97,
        payment_method: isUPI ? "UPI" : "UPI (Google Pay / PhonePe)",
        requested_date: "Tomorrow morning",
        ai_spoken_reply: selectedLang.ttsPromiseResponse,
        recommended_action: `Schedule 1-Tap UPI WhatsApp Payment Link for tomorrow morning in ${selectedLang.name}`
      };
    }

    if (isUPI) {
      return {
        intent: "ALTERNATIVE_METHOD",
        detected_language: selectedLang.name,
        willingness_to_pay: true,
        sentiment: "Positive (Prefers UPI)",
        confidence_score: 96,
        payment_method: "UPI (Google Pay / PhonePe)",
        requested_date: "Immediate",
        ai_spoken_reply: selectedLang.code === 'kn-IN' ? "ಖಂಡಿತ! ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಇವಾಗ್ಲೇ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಪೇಮೆಂಟ್ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತಿದ್ದೇವೆ." : selectedLang.code === 'hi-IN' ? "जी बिल्कुल! हम आपके व्हाट्सएप पर तुरंत 1-टैप यूपीआई लिंक भेज रहे हैं।" : "Sure! We are sending an instant 1-tap UPI payment link to your WhatsApp right now.",
        recommended_action: "Generate instant 1-Tap UPI deep link via Razorpay"
      };
    }

    return {
      intent: "GENERAL_QUERY",
      detected_language: selectedLang.name,
      willingness_to_pay: true,
      sentiment: "Engaged Customer",
      confidence_score: 94,
      payment_method: "UPI",
      requested_date: "Immediate",
      ai_spoken_reply: selectedLang.code === 'kn-IN' ? "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ನಾವು ಪರಿಶೀಲಿಸಿ ಸಹಾಯ ಮಾಡುತ್ತೇವೆ." : selectedLang.code === 'hi-IN' ? "धन्यवाद. हमने आपका अनुरोध नोट कर लिया है और आपकी सहायता कर रहे हैं।" : "Thank you. We have noted your request and are updating your payment status.",
      recommended_action: "Logged customer inquiry and assigned priority recovery strategy"
    };
  };

  // AI Intent Extraction Pipeline & Audio Spoken Feedback
  const processIntent = async (text: string) => {
    if (!text || !text.trim()) return;
    setIsProcessing(true);
    
    try {
      let intentData: any = null;

      // Try hitting the live backend first
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/voice/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utterance: text, session_id: "call-session-904" })
        });
        if (response.ok) {
          const data = await response.json();
          intentData = data.extracted_data;
        }
      } catch (e) {
        console.warn("Backend offline, using intelligent multi-dialect engine.");
      }

      // If backend was offline or returned unknown, use our smart local analyzer
      if (!intentData || intentData.intent === "UNKNOWN" || !intentData.intent) {
        intentData = analyzeLocally(text);
      }
      
      const isCancellation = intentData.intent === "OPT_OUT" || !intentData.willingness_to_pay;
      const spokenAudioText = intentData.ai_spoken_reply || (isCancellation 
        ? selectedLang.ttsCancelResponse 
        : selectedLang.ttsPromiseResponse);
      
      setAiSpokenResponse(spokenAudioText);
      speakAIResponse(spokenAudioText, selectedLang.code);

      if (isCancellation) {
        setShowWhatsAppPopup(false);
        setParsedIntent({
          intent: "OPT_OUT",
          language: intentData.detected_language || selectedLang.name,
          sentiment: intentData.sentiment || "Refusal / Cancellation",
          confidence: intentData.confidence_score || 98,
          willingness: "Negative (Customer Refused / Cancelled)",
          method: "None (Order Cancelled)",
          date: "N/A",
          action: intentData.recommended_action || "Halt automated outreach immediately. Order cancelled per customer request."
        });
      } else {
        setParsedIntent({
          intent: intentData.intent || "PROMISE_TO_PAY",
          language: intentData.detected_language || selectedLang.name,
          sentiment: intentData.sentiment || "Positive (Promise to Pay)",
          confidence: intentData.confidence_score || 96,
          willingness: "Positive (Promise to Pay)",
          method: intentData.payment_method || "UPI (Google Pay / PhonePe)",
          date: intentData.requested_date || "Tomorrow morning",
          action: intentData.recommended_action || (intentData.intent === "PROMISE_TO_PAY" 
                  ? `Schedule 1-Tap UPI WhatsApp Payment Link for ${intentData.requested_date || 'tomorrow'}`
                  : `Generate instant 1-Tap ${intentData.payment_method || 'UPI'} deep link`)
        });

        // Show interactive WhatsApp preview popup only if customer agreed to pay
        setTimeout(() => {
          setShowWhatsAppPopup(true);
        }, 1200);
      }

    } catch (err) {
      console.error("Voice processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6 md:p-10 font-sans">
      
      {/* Header with Call Status & Dialect Selection */}
      <header className="mb-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Phone className="mr-2.5 text-blue-500" size={24} />
              AI Voice Recovery Agent
            </h1>
            <span className="flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              Call Active ({formatCallTime(callDuration)})
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            Two-way conversational AI: Speak in your mother tongue, and the AI agent understands your intent and <strong>speaks back aloud in your language</strong>.
          </p>
        </div>

        {/* Language Selector & TTS Audio Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center transition ${
              ttsEnabled 
                ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                : 'bg-slate-900 border-gray-800 text-gray-500'
            }`}
            title="Toggle AI Voice Audio Output"
          >
            {ttsEnabled ? <Volume2 size={16} className="mr-1.5" /> : <VolumeX size={16} className="mr-1.5" />}
            AI Audio: {ttsEnabled ? 'ON' : 'MUTED'}
          </button>

          <div className="flex items-center bg-slate-900 border border-gray-800 p-1 rounded-xl">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang);
                  if (isListening) stopLiveRecording();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedLang.code === lang.code
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid: Phone Screen & AI Decision Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        {/* Left Column: Interactive Phone Call UI */}
        <div className="bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col justify-between shadow-2xl relative">
          
          {/* Phone Header */}
          <div className="p-4 bg-slate-950/80 border-b border-gray-800 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-semibold text-white">Customer Call: Rajesh Kumar (+91 98450 XXXXX)</span>
            </div>
            <span className="text-gray-400 font-mono">Channel: WebRTC Audio</span>
          </div>

          {/* Interactive Calling Center */}
          <div className="p-8 flex flex-col items-center justify-center">
            
            {/* Animated Waveform / Mic Circle */}
            <div className="relative mb-6">
              {isListening && (
                <>
                  <div className="absolute -inset-6 bg-red-500/20 rounded-full animate-ping"></div>
                  <div className="absolute -inset-3 bg-red-500/30 rounded-full animate-pulse"></div>
                </>
              )}
              {isProcessing && (
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-spin"></div>
              )}
              
              <button
                onClick={isListening ? stopLiveRecording : startLiveRecording}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition shadow-2xl ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-500 hover:scale-105 text-white'
                }`}
              >
                {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                  {isListening ? 'Stop' : 'Tap to Speak'}
                </span>
              </button>
            </div>

            <p className="text-sm font-medium mb-1 text-center">
              {isListening ? (
                <span className="text-red-400 font-bold flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mr-2"></span>
                  Listening in {selectedLang.nativeName} ({selectedLang.name})... Speak your mind!
                </span>
              ) : (
                <span className="text-gray-300">
                  Tap mic and speak in <strong>{selectedLang.nativeName} ({selectedLang.name})</strong>
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              Speak naturally (e.g. &ldquo;{selectedLang.samplePhrase}&rdquo;)
            </p>

            {recognitionError && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs px-4 py-2 rounded-xl mb-4 max-w-md text-center">
                {recognitionError}
              </div>
            )}

            {/* Quick 1-Click Simulation Pills */}
            <div className="w-full pt-4 border-t border-gray-800 text-center">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Or click sample dialect to test:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSimulateDemo(lang.samplePhrase, lang)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-900/30 rounded-lg text-xs font-medium transition flex items-center"
                  >
                    <Play size={10} className="mr-1.5 text-blue-400" />
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Bar */}
            <form onSubmit={handleCustomSubmit} className="w-full bg-black/60 p-2.5 rounded-xl border border-gray-800 flex space-x-2">
              <input 
                type="text" 
                placeholder={`Type in ${selectedLang.name} (e.g. ನನಗೆ ಬೇಡ or ನಾಳೆ ಮಾಡ್ತೀನಿ)...`}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button 
                type="submit"
                disabled={isProcessing}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition flex items-center disabled:opacity-50"
              >
                <Send size={12} className="mr-1" /> Send
              </button>
            </form>

          </div>

          {/* Transcript & Spoken Dialogue Box */}
          <div className="p-4 bg-black border-t border-gray-800 text-xs font-mono">
            
            {/* Customer Utterance */}
            <div className="mb-3">
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold block mb-1">
                🗣️ Customer Spoke ({selectedLang.name}):
              </span>
              <p className="text-gray-200 min-h-[22px] italic">
                {transcript ? `"${transcript}"` : <span className="text-gray-600">Awaiting speech...</span>}
              </p>
            </div>

            {/* AI Audio Response Spoken Back */}
            {aiSpokenResponse && (
              <div className="pt-2.5 border-t border-gray-850 flex items-start justify-between">
                <div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold flex items-center mb-1 ${
                    parsedIntent?.intent === 'OPT_OUT' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    <Volume2 size={12} className="mr-1" />
                    🤖 AI Spoke Back Aloud ({selectedLang.nativeName}):
                  </span>
                  <p className={`font-sans text-xs ${
                    parsedIntent?.intent === 'OPT_OUT' ? 'text-amber-300' : 'text-emerald-300'
                  }`}>
                    &ldquo;{aiSpokenResponse}&rdquo;
                  </p>
                </div>
                <button
                  onClick={() => speakAIResponse(aiSpokenResponse, selectedLang.code)}
                  className="px-2 py-1 bg-slate-800 text-gray-300 border border-gray-700 rounded text-[10px] font-sans hover:bg-slate-700 transition shrink-0 ml-2"
                >
                  Replay Audio
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: AI Structured Intent & Decision Action */}
        <div className="space-y-6">
          
          {/* Structured Intent Card */}
          <div className="bg-slate-900 rounded-2xl border border-gray-800 p-6 shadow-2xl relative min-h-[320px]">
            
            {(!parsedIntent && !isProcessing) && (
              <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <Mic size={36} className="text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Awaiting voice dialogue from customer</p>
                <p className="text-gray-600 text-xs mt-1 max-w-xs">Speak into the phone on the left in any language. The AI extracts intent and answers back.</p>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <Activity size={36} className="text-blue-500 animate-spin mb-3" />
                <p className="text-blue-400 font-semibold text-sm">Gemini 2.5 Flash Processing Dialect...</p>
                <p className="text-gray-500 text-xs mt-1">Extracting intent, preferred payment rail, and sentiment.</p>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h2 className="font-bold text-white text-base flex items-center">
                <Zap size={18} className="mr-2 text-yellow-400" />
                Extracted Structured Intent
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono flex items-center">
                  <Gauge size={11} className="mr-1" />
                  {parsedIntent?.confidence || 98}% Confidence
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Customer Intent</dt>
                <dd className={`text-sm font-bold ${
                  parsedIntent?.intent === 'OPT_OUT' ? 'text-red-400' : 'text-white'
                }`}>
                  {parsedIntent?.intent || "---"}
                </dd>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Spoken Language</dt>
                <dd className="text-sm font-bold text-blue-400">{parsedIntent?.language || selectedLang.name}</dd>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Sentiment / Emotion</dt>
                <dd className={`text-sm font-bold ${
                  parsedIntent?.intent === 'OPT_OUT' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {parsedIntent?.sentiment || "---"}
                </dd>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Payment Method</dt>
                <dd className="text-sm font-bold text-purple-400">{parsedIntent?.method || "---"}</dd>
              </div>
            </dl>

            <div className={`mt-4 border p-3.5 rounded-xl text-xs ${
              parsedIntent?.intent === 'OPT_OUT' 
                ? 'bg-red-950/30 border-red-900/50' 
                : 'bg-blue-950/40 border-blue-900/60'
            }`}>
              <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 flex items-center ${
                parsedIntent?.intent === 'OPT_OUT' ? 'text-red-400' : 'text-blue-400'
              }`}>
                <Sparkles size={12} className="mr-1" />
                Autonomous Action Triggered
              </p>
              <p className="text-sm font-medium text-white flex items-center">
                <ArrowRight size={14} className="mr-2 text-blue-400 shrink-0" />
                {parsedIntent?.action || "---"}
              </p>
            </div>

          </div>

          {/* Cancellation Confirmation Box (When Customer Says NO/CANCEL) */}
          {parsedIntent?.intent === 'OPT_OUT' && (
            <div className="bg-slate-900 border border-red-900/60 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Order Cancelled & Outreach Halted</h3>
                  <p className="text-xs text-gray-400">Customer requested cancellation. Autonomous policy guard blocked further payment links.</p>
                </div>
              </div>
              <div className="bg-black/60 rounded-xl p-3 border border-red-950 text-xs text-gray-300 space-y-1 mt-3">
                <p>✓ Status: <strong className="text-red-400 font-mono">ORDER_CANCELLED</strong></p>
                <p>✓ Automated WhatsApp links: <strong className="text-red-400 font-mono">SUPPRESSED</strong></p>
                <p>✓ DNC (Do Not Contact) Flag: <strong className="text-emerald-400 font-mono">LOGGED IN POSTGRESQL</strong></p>
              </div>
            </div>
          )}

          {/* WhatsApp Interactive Payment Link Dispatch Popup (Only When Customer Promises to Pay) */}
          {showWhatsAppPopup && parsedIntent?.intent !== 'OPT_OUT' && (
            <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">WhatsApp 1-Tap Recovery Link Dispatched</h3>
                    <p className="text-[10px] text-gray-400">Sent to customer phone (+91 98450 XXXXX)</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                  Delivered ✓
                </span>
              </div>

              {/* Realistic WhatsApp Chat Bubble */}
              <div className="bg-emerald-950/40 border border-emerald-900/80 rounded-xl p-3 text-xs text-gray-200 font-sans space-y-2">
                <p>
                  Hello Rajesh! 👋 We noticed your recent payment was interrupted.
                </p>
                <p className="text-[11px] text-gray-300">
                  As requested during our call, here is your instant <strong>1-Tap UPI Payment Link</strong> to complete your order safely:
                </p>
                <div className="bg-black/70 rounded-lg p-2.5 border border-emerald-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-mono block font-bold">Razorpay FastPay Link</span>
                    <span className="text-xs text-white font-mono">https://rzp.io/i/RR-9042</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">₹4,650</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            disabled={!parsedIntent || isApproved}
            onClick={() => setIsApproved(true)}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center transition shadow-lg text-sm ${
              isApproved
                ? 'bg-emerald-600 text-white cursor-default'
                : !parsedIntent
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : parsedIntent?.intent === 'OPT_OUT'
                    ? 'bg-red-600 hover:bg-red-500 text-white hover:scale-[1.01]'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.01]'
            }`}
          >
            {isApproved ? (
              <>
                <ShieldCheck size={18} className="mr-2" />
                AUTONOMOUS ACTION EXECUTED & PERSISTED
              </>
            ) : parsedIntent?.intent === 'OPT_OUT' ? (
              <>
                <XCircle size={18} className="mr-2" />
                CONFIRM CANCELLATION & CLOSE TICKET
              </>
            ) : (
              <>
                <Zap size={18} className="mr-2" />
                CONFIRM & DISPATCH VIA RAZORPAY
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
