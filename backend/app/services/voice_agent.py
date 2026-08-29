import os
import json
from typing import Dict, Any

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class VoiceAgent:
    """
    Agent #3: Multilingual Customer Voice & Conversational AI.
    Processes transcribed voice inputs across 6 Indian languages:
    Kannada (ಕನ್ನಡ), Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Malayalam (മലയാളം), and English.
    Converts raw conversation into structured JSON intents.
    """
    
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and HAS_GENAI:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def extract_intent(self, user_utterance: str) -> Dict[str, Any]:
        """
        Extracts structured intent from the user's voice transcript.
        Seamlessly handles multilingual audio transcripts (in native script or Latin transliteration).
        """
        if not user_utterance or not user_utterance.strip():
            return {
                "intent": "UNKNOWN",
                "payment_method": None,
                "requested_date": None,
                "willingness_to_pay": False,
                "detected_language": "Unknown"
            }

        # 1. LIVE GEMINI 2.5 FLASH INFERENCE
        if self.client:
            prompt = f"""
            You are the RevenueOS Multilingual Voice Intelligence Agent.
            Analyze this customer dialogue spoken during a payment recovery call.
            The dialogue may be in Kannada, Hindi, Tamil, Telugu, Malayalam, English, or mixed dialect (Kanglish/Hinglish/Tanglish).

            Utterance: "{user_utterance}"

            Classify into one of the following exact intents:
            - "OPT_OUT" (If the customer says they DO NOT want the product, want to CANCEL the order, or say NO/STOP/REFUSE, e.g. "ಬೇಡ", "ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ", "cancel my order", "nahi chahiye", "illai")
            - "PROMISE_TO_PAY" (If the customer agrees to pay later or tomorrow, e.g. "ನಾಳೆ ಮಾಡ್ತೀನಿ", "kal dunga", "will pay tomorrow")
            - "ALTERNATIVE_METHOD" (If the customer asks for UPI, GPay, PhonePe, QR code, or link, e.g. "UPI link kalisi", "PhonePe bhej do")
            - "DISPUTE" (If the customer claims fraud or unauthorized charge)
            - "GENERAL_QUERY" (Questions about price or product)

            Extract and return ONLY a valid JSON object:
            {{
                "intent": "OPT_OUT" | "PROMISE_TO_PAY" | "ALTERNATIVE_METHOD" | "DISPUTE" | "GENERAL_QUERY",
                "payment_method": "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NETBANKING" | "CASH" | null,
                "requested_date": string | null,
                "willingness_to_pay": boolean,
                "detected_language": string (e.g. "Kannada", "Hindi", "English", "Tamil", "Telugu", "Malayalam")
            }}
            Do not include markdown or explanations. Return raw JSON.
            """
            
            try:
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                
                raw_text = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(raw_text)
                
            except Exception as e:
                print(f"LLM voice extraction failed: {e}")

        # 2. DETERMINISTIC MULTILINGUAL FALLBACK ENGINE
        utterance = user_utterance.lower().strip()
        
        intent = {
            "intent": "UNKNOWN",
            "payment_method": None,
            "requested_date": None,
            "willingness_to_pay": False,
            "detected_language": "Unknown"
        }

        # Kannada keywords
        kannada_refusal = [
            "ಬೇಡ", "ಕ್ಯಾನ್ಸಲ್", "ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ", "ಕ್ಯಾನ್ಸಲ್ ಮಾಡು", "ಇಲ್ಲ", "ಆಗಲ್ಲ", "ಆಗೋದಿಲ್ಲ", "ಮಾಡಲ್ಲ", 
            "beda", "cancel", "cancel madi", "cancel maadi", "illa", "aagalla", "aagodilla", "madalla", "duddu illa", "kodalla"
        ]
        kannada_promise = [
            "ನಾಳೆ", "ಮಾಡ್ತೀನಿ", "ಮಾಡುತ್ತೇನೆ", "ಕೊಡ್ತೀನಿ", "ಕೊಡುತ್ತೇನೆ", "ಸಂಜೆ", "ಬೆಳಗ್ಗೆ", "ಮತ್ತೆ", 
            "naale", "madthini", "maduthene", "kodthini", "pay madthini", "kalistheeni"
        ]
        kannada_upi = ["ಯುಪಿಐ", "ಜಿಪೇ", "ಫೋನ್‌ಪೇ", "ಪೇಟಿಎಂ", "ಲಿಂಕ್", "gpay", "phonepe", "paytm", "upi"]

        # Hindi keywords
        hindi_refusal = ["नहीं", "मत करो", "रद्द", "कैंसिल", "nahi", "nahi chahiye", "mat karo", "cancel", "manaa"]
        hindi_promise = ["कल", "कर दूंगा", "दूँगा", "शाम को", "सुबह", "kal", "kar dunga", "dunga", "subah", "shaam"]
        hindi_upi = ["यूपीआई", "गूगल पे", "फोनपे", "पेटीएम"]

        # Tamil keywords
        tamil_refusal = ["வேண்டாம்", "ரத்து", "முடியாது", "இல்லை", "vendaam", "cancel", "mudiyathu", "illai"]
        tamil_promise = ["நாளை", "கட்டுகிறேன்", "naalai", "kattugiren", "katturen"]

        # Telugu keywords
        telugu_refusal = ["వద్దు", "రద్దు", "లేదు", "vaddu", "cancel", "ledu"]
        telugu_promise = ["రేపు", "చేస్తాను", "repu", "chestanu", "katthanu"]

        # English keywords
        english_refusal = ["cancel", "don't want", "dont want", "no", "stop", "never", "refuse", "not interested", "dont call", "don't call"]
        english_promise = ["tomorrow", "later", "next week", "pay soon", "evening", "morning", "will pay"]

        # =========================================================================
        # CRITICAL PRIORITY: 1. CHECK REFUSAL / OPT_OUT FIRST!
        # =========================================================================
        if any(w in utterance for w in (kannada_refusal + hindi_refusal + tamil_refusal + telugu_refusal + english_refusal)):
            intent["intent"] = "OPT_OUT"
            intent["willingness_to_pay"] = False
            intent["payment_method"] = None
            if any(w in utterance for w in kannada_refusal):
                intent["detected_language"] = "Kannada"
            elif any(w in utterance for w in hindi_refusal):
                intent["detected_language"] = "Hindi"
            elif any(w in utterance for w in tamil_refusal):
                intent["detected_language"] = "Tamil"
            elif any(w in utterance for w in telugu_refusal):
                intent["detected_language"] = "Telugu"
            else:
                intent["detected_language"] = "English"

        # 2. CHECK PROMISE TO PAY
        elif any(w in utterance for w in (kannada_promise + hindi_promise + tamil_promise + telugu_promise + english_promise)):
            intent["intent"] = "PROMISE_TO_PAY"
            intent["requested_date"] = "tomorrow"
            intent["willingness_to_pay"] = True
            intent["payment_method"] = "UPI"
            if any(w in utterance for w in kannada_promise):
                intent["detected_language"] = "Kannada"
            elif any(w in utterance for w in hindi_promise):
                intent["detected_language"] = "Hindi"
            elif any(w in utterance for w in tamil_promise):
                intent["detected_language"] = "Tamil"
            elif any(w in utterance for w in telugu_promise):
                intent["detected_language"] = "Telugu"
            else:
                intent["detected_language"] = "English"

        # 3. CHECK ALTERNATIVE UPI PAYMENT METHOD
        elif any(w in utterance for w in (kannada_upi + hindi_upi + ["upi", "gpay", "phonepe", "paytm", "google pay", "qr code", "payment link"])):
            intent["intent"] = "ALTERNATIVE_METHOD"
            intent["payment_method"] = "UPI"
            intent["willingness_to_pay"] = True
            intent["requested_date"] = "immediate"

        return intent

voice_agent = VoiceAgent()
