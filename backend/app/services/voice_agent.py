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
                "willingness_to_pay": False
            }

        # 1. LIVE GEMINI 2.5 FLASH INFERENCE
        if self.client:
            prompt = f"""
            You are the RevenueOS Multilingual Voice Intelligence Agent.
            Analyze this customer dialogue spoken during a payment recovery call.
            The dialogue may be in Kannada, Hindi, Tamil, Telugu, Malayalam, English, or mixed dialect (Kanglish/Hinglish/Tanglish).

            Utterance: "{user_utterance}"

            Extract and return ONLY a valid JSON object with the following schema:
            {{
                "intent": "PROMISE_TO_PAY" | "ALTERNATIVE_METHOD" | "DISPUTE" | "REFUSAL_TO_PAY" | "OPT_OUT" | "GENERAL_QUERY",
                "payment_method": "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NETBANKING" | "CASH" | null,
                "requested_date": string (e.g. "tomorrow", "next week", "evening", "1st of month") | null,
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

        # 2. DETERMINISTIC MULTILINGUAL FALLBACK ENGINE (Supports Native Script & Latin Transliterations)
        utterance = user_utterance.lower().strip()
        
        intent = {
            "intent": "UNKNOWN",
            "payment_method": None,
            "requested_date": None,
            "willingness_to_pay": False,
            "detected_language": "Unknown"
        }

        # Kannada keywords (Native: ನಾಳೆ, ಮಾಡ್ತೀನಿ, ಕೊಡ್ತೀನಿ, ದುಡ್ಡು, ಯುಪಿಐ | Latin: naale, madthini, kodthini, duddu, illa, beda)
        kannada_promise = ["ನಾಳೆ", "ಮಾಡ್ತೀನಿ", "ಮಾಡುತ್ತೇನೆ", "ಕೊಡ್ತೀನಿ", "ಕೊಡುತ್ತೇನೆ", "ಸಂಜೆ", "naale", "madthini", "maduthene", "kodthini", "pay madthini", "kalistheeni"]
        kannada_refusal = ["ಬೇಡ", "ಇಲ್ಲ", "ಆಗಲ್ಲ", "ಆಗೋದಿಲ್ಲ", "ಮಾಡಲ್ಲ", "beda", "illa", "aagalla", "aagodilla", "madalla"]
        kannada_upi = ["ಯುಪಿಐ", "ಜಿಪೇ", "ಫೋನ್‌ಪೇ", "upi", "gpay", "phonepe", "paytm"]

        # Hindi keywords (Native: कल, कर दूंगा, पे, नहीं | Latin: kal, kar dunga, dunga, nahi, mat karo)
        hindi_promise = ["कल", "कर दूंगा", "दूँगा", "शाम को", "kal", "kar dunga", "dunga", "subah", "shaam"]
        hindi_refusal = ["नहीं", "मत करो", "nahi", "mat karo", "manaa"]

        # Tamil keywords (Native: நாளை, கட்டு, முடியாது | Latin: naalai, kattugiren, mudiyathu)
        tamil_promise = ["நாளை", "கட்டுகிறேன்", "naalai", "kattugiren", "katturen"]
        tamil_refusal = ["முடியாது", "இல்லை", "mudiyathu", "illai"]

        # Telugu keywords (Native: రేపు, చేస్తాను, లేదు | Latin: repu, chestanu, ledu)
        telugu_promise = ["రేపు", "చేస్తాను", "repu", "chestanu", "katthanu"]
        telugu_refusal = ["లేదు", "వద్దు", "ledu", "vaddu"]

        # Malayalam keywords (Native: നാളെ, ഇല്ല | Latin: naale, tharam)
        malayalam_promise = ["നാളെ", "തരാം", "naale", "tharam", "cheyyam"]
        malayalam_refusal = ["ഇല്ല", "illa", "pattilla"]

        # General English
        english_promise = ["tomorrow", "later", "next week", "pay soon", "evening", "morning", "will pay"]
        english_refusal = ["no", "don't", "cancel", "stop", "never", "refuse", "not paying"]

        # Evaluation Pipeline
        if any(w in utterance for w in (kannada_promise + hindi_promise + tamil_promise + telugu_promise + malayalam_promise + english_promise)):
            intent["intent"] = "PROMISE_TO_PAY"
            intent["requested_date"] = "tomorrow"
            intent["willingness_to_pay"] = True
            if any(w in utterance for w in kannada_promise):
                intent["detected_language"] = "Kannada"
            elif any(w in utterance for w in hindi_promise):
                intent["detected_language"] = "Hindi"
            elif any(w in utterance for w in tamil_promise):
                intent["detected_language"] = "Tamil"
            elif any(w in utterance for w in telugu_promise):
                intent["detected_language"] = "Telugu"

        elif any(w in utterance for w in (kannada_upi + ["upi", "gpay", "phonepe", "paytm", "qr", "link", "google pay"])):
            intent["intent"] = "ALTERNATIVE_METHOD"
            intent["payment_method"] = "UPI"
            intent["willingness_to_pay"] = True

        elif any(w in utterance for w in (kannada_refusal + hindi_refusal + tamil_refusal + telugu_refusal + malayalam_refusal + english_refusal)):
            intent["intent"] = "OPT_OUT"
            intent["willingness_to_pay"] = False

        return intent

voice_agent = VoiceAgent()
