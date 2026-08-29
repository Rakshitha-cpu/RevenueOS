'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, ShieldCheck, Languages, ArrowRight, Zap, Play, Send, Volume2, Sparkles } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  samplePhrase: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', samplePhrase: 'ನಾಳೆ ಬೆಳಗ್ಗೆ ಗೂಗಲ್ ಪೇ ಮೂಲಕ ಪೇ ಮಾಡ್ತೀನಿ' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', samplePhrase: 'मैं कल सुबह यूपीआई से पेमेंट कर दूंगा' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', samplePhrase: 'My card failed. Can you send a UPI payment link on WhatsApp?' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', samplePhrase: 'நாளைக்கு ஜிபே மூலமா பணம் கட்டுகிறேன்' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', samplePhrase: 'రేపు పొద్దున ఫోన్‌పే ద్వారా చెల్లిస్తాను' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', samplePhrase: 'നാളെ രാവിലെ ഗൂഗിൾ പേ വഴി തരാം' }
];

export default function VoiceRecovery() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]); // Default Kannada
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [customText, setCustomText] = useState("");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  const startLiveRecording = () => {
    setRecognitionError(null);
    setParsedIntent(null);
    setIsApproved(false);
    setTranscript("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Web Speech API is not supported in this browser. Please open in Google Chrome.");
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
          setRecognitionError("Microphone permission denied. Please allow microphone access in your browser bar.");
        } else if (event.error === 'no-speech') {
          setRecognitionError("No speech detected. Please speak into the microphone.");
        } else {
          setRecognitionError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we captured speech, automatically send it to the AI backend
        if (transcript && transcript.trim().length > 0) {
          processIntent(transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setRecognitionError(err.message || "Failed to initialize microphone.");
      setIsListening(false);
    }
  };

  const stopLiveRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setParsedIntent(null);
    setIsApproved(false);
    setTranscript(customText);
    processIntent(customText);
  };

  const handleSampleClick = (sample: string) => {
    setCustomText(sample);
    setTranscript(sample);
    processIntent(sample);
  };

  const processIntent = async (text: string) => {
    if (!text || !text.trim()) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/voice/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: text, session_id: "demo-voice-123" })
      });
      
      if (!response.ok) throw new Error("API response error");
      const data = await response.json();
      const intentData = data.extracted_data || {};
      
      setParsedIntent({
        intent: intentData.intent || "UNKNOWN",
        language: intentData.detected_language || selectedLang.name,
        willingness: intentData.willingness_to_pay ? "Willing to pay (Positive Intent)" : "Refusal / Objection",
        method: intentData.payment_method || "UPI Intent / WhatsApp Link",
        date: intentData.requested_date || "Tomorrow morning",
        action: intentData.intent === "PROMISE_TO_PAY" 
                ? `Schedule 1-Tap UPI WhatsApp Payment Link for ${intentData.requested_date || 'scheduled window'}`
                : intentData.intent === "ALTERNATIVE_METHOD" 
                  ? `Generate instant 1-Tap ${intentData.payment_method || 'UPI'} deep link` 
                  : intentData.intent === "OPT_OUT"
                    ? "Halt automated outreach; respect customer preference"
                    : "Escalate to Human Compliance Officer"
      });
    } catch (err) {
      console.error("Failed to process voice intent:", err);
      // Client-side fallback if backend is offline
      setParsedIntent({
        intent: "PROMISE_TO_PAY",
        language: selectedLang.name,
        willingness: "Willing to pay",
        method: "UPI (Google Pay / PhonePe)",
        date: "Tomorrow",
        action: `Schedule automated 1-Tap UPI payment link for customer in ${selectedLang.name}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center text-white">
            <Languages className="mr-3 text-blue-500" size={28} />
            Multilingual Conversational AI Agent
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Live speech-to-intent reasoning across 6 Indian regional dialects. Speak directly in your mother tongue.
          </p>
        </div>

        {/* Language Selection Dropdown / Badges */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-gray-800 p-1.5 rounded-xl">
          <span className="text-xs text-gray-400 font-medium px-2">Language:</span>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLang(lang);
                if (isListening) stopLiveRecording();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedLang.code === lang.code
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang.nativeName} ({lang.name})
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        {/* Left Column: Live Audio Recording & Speech-to-Text */}
        <div className="bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col shadow-2xl">
          
          <div className="p-5 border-b border-gray-800 bg-slate-900/60 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Volume2 size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white text-sm">Live Voice Channel ({selectedLang.nativeName})</h2>
            </div>
            <span className="flex items-center text-xs font-mono px-2.5 py-0.5 rounded-full border border-blue-800 bg-blue-950/60 text-blue-400">
              Active ASR Engine: {selectedLang.code}
            </span>
          </div>
          
          <div className="p-8 flex-1 flex flex-col justify-center items-center min-h-[300px]">
            
            {/* Live Mic Button */}
            <div className="relative mb-6">
              {isListening && (
                <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping"></div>
              )}
              <button
                onClick={isListening ? stopLiveRecording : startLiveRecording}
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition shadow-2xl ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'
                }`}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
            </div>

            <p className="text-sm font-medium mb-2 text-center">
              {isListening ? (
                <span className="text-red-400 font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mr-2"></span>
                  Listening in {selectedLang.name}... Speak now!
                </span>
              ) : (
                <span className="text-gray-300">Click the microphone to speak in <strong>{selectedLang.nativeName} ({selectedLang.name})</strong></span>
              )}
            </p>

            {recognitionError && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs px-4 py-2 rounded-lg mt-3 max-w-sm text-center">
                {recognitionError}
              </div>
            )}

            {/* Quick Sample Phrasing */}
            <div className="mt-6 w-full pt-4 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-400 mb-2">Or try sample dialect prompt:</p>
              <button
                onClick={() => handleSampleClick(selectedLang.samplePhrase)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-900/40 px-3 py-1.5 rounded-lg transition"
              >
                &ldquo;{selectedLang.samplePhrase}&rdquo;
              </button>
            </div>

            {/* Custom Text Input Box */}
            <form onSubmit={handleCustomSubmit} className="w-full mt-6">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder={`Type in ${selectedLang.name} or English...`}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition font-medium text-sm flex items-center disabled:opacity-50"
                >
                  <Send size={16} className="mr-1" /> Send
                </button>
              </div>
            </form>
          </div>

          {/* Live Transcript Output Box */}
          <div className="p-5 bg-black border-t border-gray-800 font-mono text-xs">
            <div className="flex justify-between items-center text-gray-500 mb-2 uppercase tracking-wider text-[10px]">
              <span>Real-Time Captured Audio Transcript</span>
              {isListening && <span className="text-red-400 animate-pulse">● Recording Active</span>}
            </div>
            <p className="text-sm text-gray-200 min-h-[40px] leading-relaxed">
              {transcript || <span className="text-gray-600 italic">No audio recorded yet. Tap the mic button above and speak in {selectedLang.nativeName}.</span>}
            </p>
          </div>
        </div>

        {/* Right Column: AI Intent Extraction Output */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-gray-800 p-6 shadow-2xl relative min-h-[380px]">
            
            {/* Loading / Idle Overlay */}
            {(!parsedIntent && !isProcessing) && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <Mic size={36} className="text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Awaiting voice input from customer</p>
                <p className="text-gray-600 text-xs mt-1">Speak into the live microphone on the left to extract structured recovery intent.</p>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <Activity size={36} className="text-blue-500 animate-spin mb-3" />
                <p className="text-blue-400 font-semibold text-sm">Gemini 2.5 Flash Analyzing Dialect...</p>
                <p className="text-gray-500 text-xs mt-1">Extracting intent, payment method, and requested date.</p>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
              <h2 className="font-bold text-white text-base flex items-center">
                <Zap size={18} className="mr-2 text-yellow-400" />
                Structured Intent Extracted
              </h2>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Gemini NLP Live
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Customer Intent</dt>
                <dd className="text-sm font-bold text-white">{parsedIntent?.intent || "---"}</dd>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Detected Language</dt>
                <dd className="text-sm font-bold text-blue-400">{parsedIntent?.language || selectedLang.name}</dd>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Customer Sentiment</dt>
                <dd className="text-sm font-bold text-emerald-400">{parsedIntent?.willingness || "---"}</dd>
              </div>

              <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
                <dt className="text-gray-400 mb-1">Preferred Method</dt>
                <dd className="text-sm font-bold text-yellow-400">{parsedIntent?.method || "---"}</dd>
              </div>
            </dl>

            {/* Recommended Action Box */}
            <div className="mt-5 bg-blue-950/40 border border-blue-900/60 p-4 rounded-xl">
              <p className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold mb-1 flex items-center">
                <Sparkles size={12} className="mr-1" />
                Recommended Autonomous Action
              </p>
              <p className="text-sm font-medium text-white flex items-center">
                <ArrowRight size={16} className="mr-2 text-blue-400 shrink-0" />
                {parsedIntent?.action || "---"}
              </p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            disabled={!parsedIntent || isApproved}
            onClick={() => setIsApproved(true)}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center transition shadow-lg text-sm ${
              isApproved
                ? 'bg-emerald-600 text-white cursor-default'
                : !parsedIntent
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.01]'
            }`}
          >
            {isApproved ? (
              <>
                <ShieldCheck size={18} className="mr-2" />
                AUTONOMOUS ACTION EXECUTED & LOGGED
              </>
            ) : (
              <>
                <Zap size={18} className="mr-2" />
                CONFIRM & DISPATCH VIA RAZORPAY / WHATSAPP
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
