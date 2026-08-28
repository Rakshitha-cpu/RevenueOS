'use client';

import React, { useState } from 'react';
import { Mic, Activity, ShieldCheck, Languages, ArrowRight, Zap, Play, Send } from 'lucide-react';

export default function VoiceRecovery() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [customText, setCustomText] = useState("");

  const demoUtterances = [
    { lang: "English", text: "My card isn't working. Can I pay using UPI?" },
    { lang: "Kannada", text: "Nanna card work aagthilla, naale pay madthini." },
    { lang: "Hindi", text: "Main kal pay kar dunga, theek hai?" },
    { lang: "Tamil", text: "Ippo mudiyathu. Naalai kattugiren." } 
  ];

  const handleListenClick = (demoText: string) => {
    setParsedIntent(null);
    setIsApproved(false);
    setTranscript("");
    setIsListening(true);
    
    let i = 0;
    const interval = setInterval(() => {
      setTranscript(demoText.substring(0, i));
      i++;
      if (i > demoText.length) {
        clearInterval(interval);
        setIsListening(false);
        processIntent(demoText);
      }
    }, 40);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setParsedIntent(null);
    setIsApproved(false);
    setTranscript(customText);
    processIntent(customText);
  };

  const processIntent = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Actually hit the live Gemini AI backend we built!
      const response = await fetch("http://127.0.0.1:8000/api/v1/voice/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: text, session_id: "demo-123" })
      });
      
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      
      const intentData = data.extracted_data || {};
      
      setParsedIntent({
        intent: intentData.intent || "UNKNOWN",
        problem: intentData.willingness_to_pay ? "Willing to pay" : "Refusal/Opt-out",
        method: intentData.payment_method || "Not specified",
        date: intentData.requested_date || "Immediate",
        action: intentData.intent === "PROMISE_TO_PAY" 
                ? `Schedule automated payment link for ${intentData.requested_date || 'later'}`
                : intentData.intent === "ALTERNATIVE_METHOD" 
                  ? `Generate ${intentData.payment_method || 'alternative'} payment link` 
                  : "Escalate to human agent / Block Recovery"
      });
    } catch (err) {
      console.error(err);
      setParsedIntent({
         intent: "API_ERROR",
         problem: "Is the backend running?",
         method: "---",
         date: "---",
         action: "Make sure you run: uvicorn app.main:app --reload"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
          <Languages className="mr-3 text-blue-600" size={32} />
          Multilingual Voice Agent
        </h1>
        <p className="text-gray-500 mt-2">Extracts structured financial intent from unstructured audio across 6 Indian languages.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-12">
        
        {/* Left Column - Audio Input & Transcript */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Customer Audio Stream</h2>
            <div className="flex space-x-2">
              <span className="flex h-3 w-3 relative">
                {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-red-500' : 'bg-gray-300'}`}></span>
              </span>
            </div>
          </div>
          
          <div className="p-8 flex-1 flex flex-col justify-center items-center min-h-[300px]">
            {isListening ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <Mic size={40} className="text-red-500" />
                </div>
                <p className="text-red-500 font-medium">Listening...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Mic size={40} className="text-gray-400" />
                </div>
                
                <p className="text-gray-400 font-medium text-sm mb-4">Simulate a customer call:</p>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {demoUtterances.map((demo, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleListenClick(demo.text)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-sm font-medium transition flex items-center"
                    >
                      <Play size={14} className="mr-2" />
                      {demo.lang}
                    </button>
                  ))}
                </div>

                  {/* CUSTOM INPUT BOX */}
                  <form onSubmit={handleCustomSubmit} className="w-full max-w-md px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Or type custom dialogue:</p>
                      <button 
                        type="button" 
                        onClick={() => {
                          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (!SpeechRecognition) {
                            alert("Speech recognition not supported in this browser. Please use Chrome.");
                            return;
                          }
                          const recognition = new SpeechRecognition();
                          recognition.lang = 'en-IN'; // Use Indian English as baseline, usually picks up local languages decently well or we can leave it auto
                          recognition.continuous = false;
                          recognition.interimResults = true;
                          recognition.onstart = () => setIsListening(true);
                          recognition.onresult = (event: any) => {
                            const current = event.resultIndex;
                            const ts = event.results[current][0].transcript;
                            setCustomText(ts);
                            setTranscript(ts);
                          };
                          recognition.onend = () => {
                            setIsListening(false);
                          };
                          recognition.start();
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center bg-red-50 px-2 py-1 rounded"
                      >
                        <Mic size={12} className="mr-1" /> LIVE MIC
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Can I pay half today and half tomorrow?" 
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>

                </div>
              )}
            </div>

          <div className="p-6 bg-gray-900 text-white min-h-[120px] font-mono relative">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Live Transcript</p>
            <p className="text-lg">
              {transcript || <span className="text-gray-700">Waiting for audio input...</span>}
              {isListening && <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>}
            </p>
          </div>
        </div>

        {/* Right Column - Structured Output & Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[300px]">
            
            {(!parsedIntent && !isProcessing) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <p className="text-gray-400 font-medium flex items-center">
                  <Activity size={18} className="mr-2" />
                  Awaiting Intent Extraction
                </p>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <p className="text-blue-600 font-medium flex items-center animate-pulse">
                  <Activity size={18} className="mr-2" />
                  Extracting Intent via Gemini API...
                </p>
              </div>
            )}

            <div className="p-6 border-b border-gray-100 bg-blue-50/30">
              <h2 className="font-semibold text-blue-900 flex items-center">
                <Zap className="mr-2 text-blue-600" size={20} />
                Extracted Structured Intent
              </h2>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Customer Intent</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{parsedIntent?.intent || "---"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Problem Detected</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{parsedIntent?.problem || "---"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Preferred Method</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{parsedIntent?.method || "---"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Requested Date</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{parsedIntent?.date || "---"}</dd>
                </div>
              </dl>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Recommended AI Action</p>
                <p className="text-blue-700 font-medium flex items-center">
                  <ArrowRight size={16} className="mr-2" />
                  {parsedIntent?.action || "---"}
                </p>
              </div>
            </div>
          </div>

          {(() => {
            const isEscalation = parsedIntent?.action?.includes("Escalate");
            return (
              <button 
                disabled={!parsedIntent || isApproved}
                onClick={() => setIsApproved(true)}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition shadow-sm ${
                  isApproved 
                    ? 'bg-green-500 text-white cursor-default'
                    : !parsedIntent 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isEscalation
                        ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.01]'
                        : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.01]'
                }`}
              >
                {isApproved ? (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    ACTION COMPLETED
                  </>
                ) : isEscalation ? (
                  <>
                    <ShieldCheck size={20} className="mr-2" />
                    CONFIRM HUMAN HANDOFF
                  </>
                ) : (
                  <>
                    <Zap size={20} className="mr-2" />
                    AUTOPILOT: INITIATE STRATEGY
                  </>
                )}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 2-5.9 3 10 10 0 0 1-5.9-3" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}
