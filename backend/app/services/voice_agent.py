import os
import json
import re
from typing import Dict, Any, List, Optional

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class VoiceAgent:
    """
    Agent #3: Human-Grade Vigilant Telecaller & Recovery Officer (Priya).
    Features:
    - Step-by-step multi-turn state progression with zero repetitive loops.
    - Probes motives for cancellations, verifies identity and order params.
    - Handles channel requests (SMS, WhatsApp, UPI switch, Card retry).
    - Seamlessly escalates to Senior Specialist Vikram when human judgement is needed.
    """
    
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and HAS_GENAI:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def extract_intent(self, user_utterance: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Vigilant telecaller evaluation with dynamic multi-turn step progression.
        """
        if not user_utterance or not user_utterance.strip():
            return {
                "intent": "UNKNOWN",
                "ai_spoken_reply": "Hello Rajesh! I am your official Razorpay Assistant. How can I assist you regarding your Apple AirPods Pro order today?",
                "payment_method": None,
                "requested_date": None,
                "willingness_to_pay": False,
                "detected_language": "Unknown",
                "confidence_score": 0,
                "sentiment": "Neutral",
                "recommended_action": "Awaiting customer response"
            }

        # Format history string
        history_context = ""
        if history and len(history) > 0:
            history_lines = []
            for item in history[-6:]:
                role = "Customer" if item.get("role") == "customer" else "Agent"
                history_lines.append(f"{role}: {item.get('text', '')}")
            history_context = "\nPrevious Conversation History:\n" + "\n".join(history_lines) + "\n"

        # 1. LIVE GEMINI 2.5 FLASH TELECALLER CONVERSATION
        if self.client:
            prompt = f"""
            You are the official Razorpay Assistant, a human-grade, alert, and courteous customer verification telecaller for Razorpay.
            You are speaking with customer Rajesh Kumar (+91 98450 XXXXX) regarding his pending Order #RZP-8921 (Apple AirPods Pro - ₹4,650).
            
            {history_context}
            Customer just said: "{user_utterance}"

            CRITICAL MULTI-TURN RULES:
            1. PROGRESS THE CONVERSATION - NEVER REPEAT THE SAME ANSWER TWICE IN A ROW.
            2. If the customer requests "Send SMS Copy":
               - Confirm that the SMS with payment link has been dispatched to +91 98450 XXXXX.
               - Ask if they'd like to pay now via Google Pay or PhonePe.
            3. If the customer requests "Open WhatsApp Link" or "Switch to UPI":
               - Confirm the green-badged Razorpay WhatsApp link is open.
               - Ask which UPI app they prefer: Google Pay, PhonePe, or Paytm.
            4. If the customer requests "Verify Card Details" or "Retry Card":
               - Explain the HDFC gateway timeout (E_504) and offer a 10-minute retry or 1-tap UPI bypass.
            5. If the customer asks to CANCEL:
               - Inspect motive (price too high, delivery delay, ordered by mistake) and offer SAVE232 (₹4,418) or human manager transfer.
            6. If customer asks for human manager:
               - Execute live transfer to Senior Specialist Vikram.
            7. Speak naturally in the customer's language.

            Return valid JSON only:
            {{
                "ai_spoken_reply": string,
                "intent": string,
                "detected_language": string,
                "willingness_to_pay": boolean,
                "confidence_score": number,
                "sentiment": string,
                "payment_method": string or null,
                "requested_date": string or null,
                "recommended_action": string,
                "quick_replies": [string]
            }}
            """
            
            try:
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                raw_text = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(raw_text)
            except Exception as e:
                print(f"LLM telecaller error: {e}")

        # 2. DETERMINISTIC MULTI-TURN TELECALLER ENGINE (Progressive States)
        t = user_utterance.lower().strip()

        # Step A: Human Escalation
        if re.search(r'\b(human|manager|senior|officer|talk to person|person|ವಿಕ್ರಮ್|ಮ್ಯಾನೇಜರ್|इंसान|अधिकारी)\b', t):
            is_kn = any(w in t for w in ["ವಿಕ್ರಮ್", "ಮ್ಯಾನೇಜರ್", "ವ್ಯಕ್ತಿ"])
            return {
                "ai_spoken_reply": "ಖಂಡಿತ ರಾಜೇಶ್ ಅವರೇ. ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 (₹4,650) ವಿವರಗಳೊಂದಿಗೆ ಹಿರಿಯ ಮ್ಯಾನೇಜರ್ ವಿಕ್ರಮ್ ಅವರಿಗೆ ಲೈವ್ ಕಾಲ್ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು 5 ಸೆಕೆಂಡುಗಳು ಹೋಲ್ಡ್‌ನಲ್ಲಿರಿ." if is_kn else "Certainly Rajesh. I am compiling your verified case (Order #RZP-8921, ₹4,650) and transferring you to Senior Manager Vikram right now. Please hold for 5 seconds.",
                "intent": "HUMAN_ESCALATION",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 99,
                "sentiment": "Escalated to Human",
                "payment_method": "Verified Transfer",
                "requested_date": "Immediate",
                "recommended_action": "Transferred live call to Senior Manager Vikram at Razorpay Desk",
                "quick_replies": ["✓ Connected with Vikram", "Cancel Transfer"]
            }

        # Step B: SMS Delivery Request (DO NOT REPEAT INITIAL CONFIRMATION)
        if re.search(r'\b(sms|text message|send sms|ಎಸ್ಎಂಎಸ್|ಮೆಸೇಜ್|एसएमएस)\b', t):
            is_kn = any(w in t for w in ["ಎಸ್ಎಂಎಸ್", "ಮೆಸೇಜ್"])
            return {
                "ai_spoken_reply": "ಖಂಡಿತ! ಪಾವತಿ ಲಿಂಕ್ ಹೊಂದಿರುವ SMS ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ +91 98450 XXXXX ಗೆ ರವಾನಿಸಲಾಗಿದೆ. ನೀವು ಗೂಗಲ್ ಪೇ ಅಥವಾ ಫೋನ್‌ಪೇ ಮೂಲಕ ಪಾವತಿಸಲು ಬಯಸುತ್ತೀರಾ?" if is_kn else "Done! A secure SMS with your 1-Tap payment link has been dispatched to +91 98450 XXXXX. Would you prefer completing it via Google Pay or PhonePe?",
                "intent": "SMS_DISPATCHED",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": true,
                "confidence_score": 99,
                "sentiment": "Positive (Channel Switch)",
                "payment_method": "SMS Link",
                "requested_date": "Immediate",
                "recommended_action": "Dispatched verified SMS payment deep link to customer mobile",
                "quick_replies": ["Google Pay", "PhonePe", "Paytm UPI", "Check Delivery Status"]
            }

        # Step C: WhatsApp Link / UPI Switch Request
        if re.search(r'\b(whatsapp|switch to upi|upi|gpay|google pay|phonepe|paytm|ವಾಟ್ಸಾಪ್|ಯುಪಿಐ|ಜಿಪೇ|ಫೋನ್‌ಪೇ|व्हाट्सएप|यूपीआई)\b', t):
            is_kn = any(w in t for w in ["ವಾಟ್ಸಾಪ್", "ಯುಪಿಐ", "ಜಿಪೇ", "ಫೋನ್‌ಪೇ"])
            return {
                "ai_spoken_reply": "ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಅಧಿಕೃತ Razorpay 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀವು Google Pay, PhonePe ಅಥವಾ Paytm ಮೂಲಕ ತಕ್ಷಣ ಪೂರ್ಣಗೊಳಿಸಬಹುದೇ?" if is_kn else "Your verified 1-Tap UPI link is now active in WhatsApp. Would you like to complete payment using Google Pay, PhonePe, or Paytm?",
                "intent": "UPI_SELECTION",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Positive (Prefers UPI)",
                "payment_method": "UPI Intent (GPay/PhonePe)",
                "requested_date": "Immediate",
                "recommended_action": "Awaiting customer app selection to complete 1-tap checkout",
                "quick_replies": ["✓ Paid via Google Pay", "✓ Paid via PhonePe", "Need Split Payment", "Talk to Manager"]
            }

        # Step D: Card Decline / Verification Inquiry
        if re.search(r'\b(card|verify card|bank|retry|timeout|ಕಾರ್ಡ್|ಬ್ಯಾಂಕ್|कार्ड)\b', t):
            is_kn = any(w in t for w in ["ಕಾರ್ಡ್", "ಬ್ಯಾಂಕ್"])
            return {
                "ai_spoken_reply": "ಆಡಿಟ್ ವರದಿ: HDFC ಗೇಟ್‌ವೇ E_504 ದೋಷ ನೀಡಿದೆ. ನಿಮ್ಮ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಯಾವುದೇ ದೋಷವಿಲ್ಲ. 10 ನಿಮಿಷದಲ್ಲಿ ಮರುಪ್ರಯತ್ನಿಸುತ್ತೀರಾ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಯುಪಿಐ ಬಳಸುತ್ತೀರಾ?" if is_kn else "Audit Log: HDFC Gateway timed out (E_504). Your card is perfectly active with zero fraud flags. Would you like to retry in 10 minutes or use 1-Tap UPI?",
                "intent": "CARD_DIAGNOSTIC",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Technical Complaint",
                "payment_method": "HDFC Card / UPI",
                "requested_date": "Immediate",
                "recommended_action": "Provided live bank downtime diagnostic",
                "quick_replies": ["Switch to UPI", "Retry Card Now", "Escalate to Human"]
            }

        # Step E: Cancellation Request (PROBE REASON, NEVER BLIND CANCEL!)
        if re.search(r'\b(cancel|dont want|don\'t want|stop|not interested|ಕ್ಯಾನ್ಸಲ್|ಬೇಡ|रद्द)\b', t):
            is_kn = any(w in t for w in ["ಕ್ಯಾನ್ಸಲ್", "ಬೇಡ"])
            return {
                "ai_spoken_reply": "ಆರ್ಡರ್ #RZP-8921 (Apple AirPods Pro - ₹4,650) ರದ್ದು ಮಾಡುವ ಮುನ್ನ, ನೀವು ಏಕೆ ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲು ಬಯಸುತ್ತಿದ್ದೀರಿ ಎಂದು ತಿಳಿಸಬಹುದೇ: ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ ಅಥವಾ ಡೆಲಿವರಿ ತಡವಾಗಿದೆಯೇ?" if is_kn else "Before I authorize cancellation for Order #RZP-8921 (Apple AirPods Pro - ₹4,650), may I inspect why you would like to cancel: is it delivery time, high price, or would you like to speak with a human manager?",
                "intent": "CANCEL_INSPECTION",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": False,
                "confidence_score": 98,
                "sentiment": "Inspecting Cancellation Grounds",
                "payment_method": None,
                "requested_date": None,
                "recommended_action": "Inspecting cancellation grounds & assessing retention options",
                "quick_replies": ["Found Cheaper Elsewhere", "Delivery Taking Too Long", "Talk to Human Manager", "Confirm Final Cancel"]
            }

        # Step F: Price Objection / Discount
        if re.search(r'\b(cheap|cheaper|expensive|price|discount|offer|ದುಬಾರಿ|ಕಡಿಮೆ|महंगा|सस्ता)\b', t):
            is_kn = any(w in t for w in ["ದುಬಾರಿ", "ಕಡಿಮೆ", "ಡಿಸ್ಕೌಂಟ್"])
            return {
                "ai_spoken_reply": "ಪರಿಶೀಲನೆಯಂತೆ: ನಾನು ತಕ್ಷಣ 5% ಮ್ಯಾನೇಜರ್ ರಿಯಾಯಿತಿ (SAVE232) ಅನ್ವಯಿಸಿ ಒಟ್ಟು ಮೊತ್ತವನ್ನು ₹4,418 ಗೆ ಇಳಿಸಬಹುದು. ಈ ಅಧಿಕೃತ ಲಿಂಕ್ ಕಳುಹಿಸಲೆ?" if is_kn else "I have inspected our merchant authorization: I can apply an official 5% retention discount (SAVE232) reducing your cart from ₹4,650 to ₹4,418. Shall I send this verified link?",
                "intent": "PRICE_RETENTION",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Price Objection Inspected",
                "payment_method": "UPI (with ₹232 Discount)",
                "requested_date": "Immediate",
                "recommended_action": "Applied dynamic 5% retention incentive",
                "quick_replies": ["✓ Accept ₹4,418 Offer", "Still Want to Cancel", "Talk to Manager"]
            }

        # Step G: Split Payment
        if re.search(r'\b(half|split|installment|installments|two parts|emi|ಭಾಗ|ಅರ್ಧ)\b', t):
            is_kn = any(w in t for w in ["ಭಾಗ", "ಅರ್ಧ", "split"])
            return {
                "ai_spoken_reply": "ಅನುಮೋದನೆ ದೊರೆತಿದೆ: ಭಾಗ 1 (₹2,325) ಈಗ ಪಾವತಿಸಿ ಆರ್ಡರ್ ಕಳುಹಿಸಲಾಗುತ್ತದೆ; ಭಾಗ 2 (₹2,325) ಮುಂದಿನ ಸೋಮವಾರ ಪಾವತಿಸಬಹುದು (0% ಬಡ್ಡಿ). ಒಪ್ಪಿಗೆಯೇ?" if is_kn else "Verification Approved: Part 1 of ₹2,325 payable now via UPI to secure dispatch; Part 2 of ₹2,325 scheduled for next Monday with zero interest. Shall I generate this official split link?",
                "intent": "SPLIT_INSPECTION",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Positive (Installments)",
                "payment_method": "UPI Split Link",
                "requested_date": "Immediate (50%) + Next Monday (50%)",
                "recommended_action": "Generated authenticated 2-part split payment link",
                "quick_replies": ["✓ Approve ₹2,325 Split Link", "Check 3-Month EMI"]
            }

        # Step H: Verified Confirmation
        if re.search(r'\b(yes|pay|send|confirm|okay|done|accept|paid|ಆಯ್ತು|ಸರಿ|ಹೌದು|ಮಾಡಿದೆ|हाँ)\b', t):
            is_kn = any(w in t for w in ["ಆಯ್ತು", "ಸರಿ", "ಹೌದು", "ಮಾಡಿದೆ"])
            return {
                "ai_spoken_reply": "ಧನ್ಯವಾದಗಳು ರಾಜೇಶ್ ಅವರೇ! ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಆರ್ಡರ್ #RZP-8921 ಅನ್ನು ರವಾನಿಸಲು ಅನುಮೋದಿಸಲಾಗಿದೆ. ರಶೀದಿ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿದೆ." if is_kn else "Thank you Rajesh! Order #RZP-8921 confirmed. Your Apple AirPods Pro order is now approved for immediate dispatch.",
                "intent": "VERIFIED_CONFIRMATION",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 99,
                "sentiment": "Positive / Verified",
                "payment_method": "UPI Intent",
                "requested_date": "Immediate",
                "recommended_action": "Delivered authenticated 1-Tap UPI deep link",
                "quick_replies": ["Download Invoice", "Track Delivery"]
            }

        # Default Telecaller Inspection
        return {
            "ai_spoken_reply": "I am inspecting that for you right now regarding Order #RZP-8921 (Apple AirPods Pro - ₹4,650). How would you prefer to proceed?",
            "intent": "INSPECTION_QUERY",
            "detected_language": "English",
            "willingness_to_pay": True,
            "confidence_score": 96,
            "sentiment": "Attentive",
            "payment_method": "Verified UPI / Card",
            "requested_date": "Immediate",
            "recommended_action": "Inspected account details and awaiting customer preference",
            "quick_replies": ["Switch to UPI", "Send SMS Copy", "Transfer to Human"]
        }

voice_agent = VoiceAgent()
