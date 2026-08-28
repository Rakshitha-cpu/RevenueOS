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
    Agent #3: Customer Voice Agent.
    Processes transcribed voice inputs in 6 languages:
    English, Hindi, Kannada, Tamil, Telugu, and Malayalam.
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
        Seamlessly handles multilingual inputs.
        """
        if self.client:
            prompt = f"""
            You are the RevenueOS Customer Voice Agent.
            Analyze the following customer utterance (which may be in English, Hindi, Kannada, Tamil, Telugu, or Malayalam).
            
            Extract the following structured intent:
            - "intent": The primary category (e.g., PROMISE_TO_PAY, ALTERNATIVE_METHOD, DISPUTE, REFUSAL_TO_PAY, OPT_OUT)
            - "payment_method": If the user mentions a preferred method (e.g., UPI, CREDIT_CARD, CASH). Null if not mentioned.
            - "requested_date": If the user promises to pay later, extract the timeframe (e.g., "tomorrow", "next week"). Null if not mentioned.
            - "willingness_to_pay": Boolean (true/false) indicating if the user is open to paying eventually.

            Utterance: "{user_utterance}"

            Return ONLY valid JSON. Do not include markdown formatting.
            """
            
            try:
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                
                # Clean up markdown blocks if the LLM adds them
                raw_text = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(raw_text)
                
            except Exception as e:
                print(f"LLM extraction failed: {e}")
                return {"intent": "ERROR", "willingness_to_pay": False, "error": str(e)}

        # ---------------------------------------------------------
        # DETERMINISTIC MULTILINGUAL FALLBACK (If no API key provided)
        # ---------------------------------------------------------
        utterance = user_utterance.lower()
        
        # Default assumption
        intent = {
            "intent": "UNKNOWN",
            "payment_method": None,
            "requested_date": None,
            "willingness_to_pay": False
        }

        # 1. Check for Promise to Pay (Tomorrow / Later)
        # English: tomorrow | Hindi: kal | Kannada: naale | Tamil: நாளை (naalai) | Telugu: రేపు (repu) | Malayalam: നാളെ (naale)
        if any(word in utterance for word in ["tomorrow", "kal", "naale", "naalai", "repu"]):
            intent["intent"] = "PROMISE_TO_PAY"
            intent["requested_date"] = "tomorrow"
            intent["willingness_to_pay"] = True
            
        # 2. Check for Alternative Method (UPI)
        elif "upi" in utterance or "gpay" in utterance or "phonepe" in utterance:
            intent["intent"] = "ALTERNATIVE_METHOD"
            intent["payment_method"] = "UPI"
            intent["willingness_to_pay"] = True
            
        # 3. Check for Opt-Out / Refusal
        # English: no / don't | Hindi: nahi | Kannada: beda / illa | Tamil: illai | Telugu: ledu
        elif any(word in utterance for word in ["no", "don't", "nahi", "illa", "beda", "illai", "ledu"]):
            intent["intent"] = "OPT_OUT"
            intent["willingness_to_pay"] = False

        return intent

voice_agent = VoiceAgent()
