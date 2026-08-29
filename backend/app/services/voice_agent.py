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
    Agent #3: Structured Conversational Recovery Assistant (Airtel / GPay style).
    Deterministic scenario routing, contextual clarifying questions, and multi-turn state.
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
        Dynamically analyzes customer sentences in the context of the 10 interactive scenarios.
        Uses exact intent boundaries to avoid cross-scenario collisions.
        """
        if not user_utterance or not user_utterance.strip():
            return {
                "intent": "UNKNOWN",
                "ai_spoken_reply": "I am listening. How may I assist you with your Razorpay transaction today?",
                "payment_method": None,
                "requested_date": None,
                "willingness_to_pay": False,
                "detected_language": "Unknown",
                "confidence_score": 0,
                "sentiment": "Neutral",
                "recommended_action": "Awaiting customer dialogue"
            }

        # Format history string for multi-turn awareness
        history_context = ""
        if history and len(history) > 0:
            history_lines = []
            for item in history[-6:]:
                role = "Customer" if item.get("role") == "customer" else "Agent"
                history_lines.append(f"{role}: {item.get('text', '')}")
            history_context = "\nPrevious Conversation History:\n" + "\n".join(history_lines) + "\n"

        # 1. LIVE GEMINI 2.5 FLASH CONVERSATIONAL REASONING
        if self.client:
            prompt = f"""
            You are RevenueOS—an empathetic, highly intelligent conversational recovery agent for Razorpay.
            The customer is on an active phone call regarding a payment.
            {history_context}
            Customer just said: "{user_utterance}"

            Instructions:
            1. Generate a natural, helpful 1-2 sentence spoken reply answering the customer in the EXACT SAME LANGUAGE and dialect they spoke.
               - Split / Installments (e.g. "half now", "split payment", "half next week"): Explain they can pay half (₹2,325) now and balance later. DO NOT confuse with tomorrow schedule!
               - Card Decline: Explain bank timeout and offer 1-tap UPI.
               - UPI Request: Ask if they prefer Google Pay or PhonePe.
               - Tomorrow Schedule: Ask what time tomorrow works best.
               - Double Debit: Reassure with instant T+0 reversal (<2s) and confirm UTR.
               - Discounts: Offer 5% cashback discount.
               - Security/Fraud: Explain 256-bit encryption and offer to verify or freeze.
               - GST Invoice: Offer to attach company GSTIN.
               - Store Credit: Offer ₹4,882 store credit voucher (+5% bonus).
               - Cancellation: Acknowledge cancellation politely and stop future calls.
            2. Classify intent: "SPLIT_PAYMENT" | "CARD_DECLINE" | "UPI_SWITCH" | "PROMISE_TO_PAY" | "REFUND_REQUEST" | "PRICE_DISCOUNT" | "FRAUD_CHECK" | "GST_INVOICE" | "STORE_CREDIT" | "OPT_OUT" | "GREETING" | "GENERAL_QUERY"
            3. Rate customer sentiment: "Positive" | "Neutral" | "Technical Complaint" | "Price Sensitive" | "Refusal / Cancellation" | "Frustrated / Refund"
            4. Calculate an NLU Accuracy Confidence Score (integer 92-99).

            Return ONLY valid JSON:
            {{
                "ai_spoken_reply": string,
                "intent": string,
                "detected_language": string,
                "willingness_to_pay": boolean,
                "confidence_score": number,
                "sentiment": string,
                "payment_method": string or null,
                "requested_date": string or null,
                "recommended_action": string
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
                print(f"LLM conversational extraction error: {e}")

        # 2. DETERMINISTIC HIERARCHICAL CLASSIFIER (Ordered to prevent cross-matching)
        t = user_utterance.lower().strip()

        # PRIORITY 1: Split / Partial / Half / Installments (Must come BEFORE tomorrow/schedule!)
        if re.search(r'\b(half|split|installment|installments|two parts|emi|50%|ಭಾಗ|ಅರ್ಧ|ಆಧಾ)\b', t):
            is_kn = any(w in t for w in ["ಭಾಗ", "ಅರ್ಧ", "half", "split"])
            return {
                "ai_spoken_reply": "ಖಂಡಿತ! ನೀವು ಈಗ ಅರ್ಧ ಮೊತ್ತವನ್ನು (₹2,325) ಯುಪಿಐ ಮೂಲಕ ಪಾವತಿಸಿ, ಉಳಿದ ಮೊತ್ತವನ್ನು ಮುಂದಿನ ವಾರ ಪಾವತಿಸಲು ಬಯಸುತ್ತೀರಾ?" if is_kn else "Yes! Would you like to pay half (₹2,325) right now via UPI, and schedule the remaining balance for next week?",
                "intent": "SPLIT_PAYMENT",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Positive (Installments)",
                "payment_method": "UPI Split Link",
                "requested_date": "Immediate (50%) + Next Week (50%)",
                "recommended_action": "Generate 2-part split payment link via Razorpay"
            }

        # PRIORITY 2: Explicit Cancellations / Opt-Out
        if re.search(r'\b(cancel my order|cancel order|cancel it|dont want|don\'t want|not interested|stop calling|refuse|ಬೇಡ|ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ|nahi chahiye|radd karo)\b', t):
            is_kn = any(w in t for w in ["ಬೇಡ", "ಕ್ಯಾನ್ಸಲ್", "ಮಾಡಲ್ಲ"])
            return {
                "ai_spoken_reply": "ಖಂಡಿತ, ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಈ ಆರ್ಡರ್ ಅನ್ನು ಕ್ಯಾನ್ಸಲ್ ಮಾಡಲಾಗಿದೆ. ನಾವು ಇನ್ನು ಮುಂದೆ ಕರೆ ಮಾಡುವುದಿಲ್ಲ." if is_kn else "We respect your decision. Your order has been cancelled and all future recovery calls have been paused. Have a wonderful day!",
                "intent": "OPT_OUT",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": False,
                "confidence_score": 98,
                "sentiment": "Refusal / Cancellation",
                "payment_method": None,
                "requested_date": None,
                "recommended_action": "Halt automated outreach immediately. Order cancelled per customer request."
            }

        # PRIORITY 3: Double-Debit / Instant T+0 Refund
        if re.search(r'\b(refund|money deducted|double debit|paisa cut|deducted|ರೀಫಂಡ್|ಕಟ್ ಆಗಿದೆ|रिफंड)\b', t):
            is_kn = any(w in t for w in ["ರೀಫಂಡ್", "ಕಟ್"])
            return {
                "ai_spoken_reply": "ಚಿಂತೆ ಮಾಡಬೇಡಿ! ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ 2.1 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ₹4,650 ರಿಫಂಡ್ ಜಮೆ ಮಾಡಲಾಗುತ್ತಿದೆ. UTR ಸಂಖ್ಯೆಯನ್ನು ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ." if is_kn else "Don't worry! We are issuing an instant T+0 reversal of ₹4,650 to your bank account in 2.1 seconds. Your UTR has been sent to WhatsApp.",
                "intent": "REFUND_REQUEST",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": False,
                "confidence_score": 98,
                "sentiment": "Frustrated / Refund",
                "payment_method": "UPI_INSTANT_REVERSAL",
                "requested_date": "Immediate",
                "recommended_action": "Execute T+0 Instant Refund via Razorpay and deliver UTR"
            }

        # PRIORITY 4: Discounts & Offers
        if re.search(r'\b(cheap|discount|cashback|offer|coupon|promo|price|ಡಿಸ್ಕೌಂಟ್|ಆಫರ್)\b', t):
            is_kn = any(w in t for w in ["ಡಿಸ್ಕೌಂಟ್", "ಆಫರ್"])
            return {
                "ai_spoken_reply": "ಇಂದು 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಪಾವತಿಗೆ 5% ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಆಫರ್ ಲಭ್ಯವಿದೆ. ನಿಮ್ಮ ಪಾವತಿ ಲಿಂಕ್‌ಗೆ SAVE5 ಕೂಪನ್ ಅನ್ವಯಿಸಬೇಕೆ?" if is_kn else "We have an instant 5% cashback discount available on 1-Tap UPI payments today. Would you like me to apply promo code SAVE5 to your payment link?",
                "intent": "PRICE_DISCOUNT",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 96,
                "sentiment": "Price Sensitive",
                "payment_method": "UPI (with 5% Discount)",
                "requested_date": "Immediate",
                "recommended_action": "Apply dynamic 5% UPI discount and send checkout link"
            }

        # PRIORITY 5: Card Decline / Timeout
        if re.search(r'\b(card.*failed|card.*not working|card decline|declined|server down|bank timeout|ಕಾರ್ಡ್.*ಆಗ್ತಿಲ್ಲ|ಕಾರ್ಡ್ ವರ್ಕ್)\b', t):
            is_kn = any(w in t for w in ["ಕಾರ್ಡ್", "ಆಗ್ತಿಲ್ಲ", "ವರ್ಕ್"])
            return {
                "ai_spoken_reply": "ಬ್ಯಾಂಕ್ ಸರ್ವರ್ ಸಮಸ್ಯೆಯಿಂದ ಕಾರ್ಡ್ ಪಾವತಿ ವಿಫಲವಾಗಿದೆ. ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲೆ ಅಥವಾ 10 ನಿಮಿಷಗಳ ನಂತರ ಮರುಪ್ರಯತ್ನಿಸುತ್ತೀರಾ?" if is_kn else "We noticed a temporary bank gateway timeout on your card. Would you prefer an instant 1-tap UPI link on WhatsApp, or would you like to retry your card in 10 minutes?",
                "intent": "CARD_DECLINE",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Technical Complaint",
                "payment_method": "UPI (Google Pay / PhonePe)",
                "requested_date": "Immediate",
                "recommended_action": "Offer smart UPI auto-reroute to bypass bank downtime"
            }

        # PRIORITY 6: Switch to 1-Tap UPI
        if re.search(r'\b(gpay|google pay|phonepe|paytm|switch to upi|send upi|ಯುಪಿಐ|ಜಿಪೇ|ಫೋನ್‌ಪೇ)\b', t):
            is_kn = any(w in t for w in ["ಯುಪಿಐ", "ಜಿಪೇ", "ಫೋನ್‌ಪೇ", "ಕಳಿಸಿ"])
            return {
                "ai_spoken_reply": "ಖಂಡಿತ! ನೀವು ಯಾವ ಆ್ಯಪ್ ಬಳಸುತ್ತೀರಿ: Google Pay, PhonePe ಅಥವಾ Paytm? ಇವಾಗ್ಲೇ ವಾಟ್ಸಾಪ್‌ಗೆ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ." if is_kn else "Sure! Which UPI app do you prefer: Google Pay, PhonePe, or Paytm? We can send the 1-tap link directly to your WhatsApp.",
                "intent": "UPI_SWITCH",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Positive (Prefers UPI)",
                "payment_method": "UPI (Google Pay / PhonePe)",
                "requested_date": "Immediate",
                "recommended_action": "Generate instant 1-Tap UPI deep link via Razorpay"
            }

        # PRIORITY 7: Schedule Tomorrow
        if re.search(r'\b(tomorrow|schedule|morning|evening|will pay tomorrow|ನಾಳೆ|ಬೆಳಗ್ಗೆ|ಸಂಜೆ|kal)\b', t):
            is_kn = any(w in t for w in ["ನಾಳೆ", "ಮಾಡ್ತೀನಿ", "ಸಂಜೆ"])
            return {
                "ai_spoken_reply": "ಖಂಡಿತ! ನಾಳೆ ಯಾವ ಸಮಯ ನಿಮಗೆ ಅನುಕೂಲಕರ: ಬೆಳಗ್ಗೆ 9:00 ಗಂಟೆಗೆ ಅಥವಾ ಮಧ್ಯಾಹ್ನ 11:30 ಕ್ಕೆ?" if is_kn else "Understood! What time tomorrow works best for you: 9:00 AM or 11:30 AM before banking hours?",
                "intent": "PROMISE_TO_PAY",
                "detected_language": "Kannada" if is_kn else "English",
                "willingness_to_pay": True,
                "confidence_score": 97,
                "sentiment": "Positive (Promise to Pay)",
                "payment_method": "UPI",
                "requested_date": "Tomorrow morning",
                "recommended_action": "Schedule 1-Tap UPI WhatsApp Payment Link for customer window"
            }

        # PRIORITY 8: Fraud & Security
        if re.search(r'\b(fraud|unauthorized|stolen|security|suspicious|safe|ಸುರಕ್ಷಿತ)\b', t):
            return {
                "ai_spoken_reply": "Security is our highest priority. Did you attempt this ₹4,650 transaction at 10:14 PM, or should we immediately freeze this transaction and escalate to our fraud desk?",
                "intent": "FRAUD_CHECK",
                "detected_language": "English",
                "willingness_to_pay": False,
                "confidence_score": 97,
                "sentiment": "Suspicious / Security",
                "payment_method": None,
                "requested_date": "Immediate",
                "recommended_action": "Freeze transaction and trigger instant War Room compliance audit"
            }

        # PRIORITY 9: Corporate GST Invoice
        if re.search(r'\b(gst|invoice|b2b|tax invoice|company|business|ಜಿಎಸ್‌ಟಿ|ಇನ್‌ವಾಯ್ಸ್)\b', t):
            return {
                "ai_spoken_reply": "Certainly! Would you like a B2B tax invoice generated with your company GSTIN upon payment completion?",
                "intent": "GST_INVOICE",
                "detected_language": "English",
                "willingness_to_pay": True,
                "confidence_score": 97,
                "sentiment": "Positive (Corporate)",
                "payment_method": "Netbanking / Corporate Card",
                "requested_date": "Immediate",
                "recommended_action": "Attach automated GSTIN tax invoice generator to payment receipt"
            }

        # PRIORITY 10: Store Credit Boost
        if re.search(r'\b(store credit|voucher|wallet|perk|bonus|goodwill|ವೋಚರ್)\b', t):
            return {
                "ai_spoken_reply": "Instead of waiting for bank settlement, would you like an instant ₹4,882 store credit voucher (including a 5% bonus) to complete your order immediately?",
                "intent": "STORE_CREDIT",
                "detected_language": "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Positive (Store Credit)",
                "payment_method": "Store Credit",
                "requested_date": "Immediate",
                "recommended_action": "Issue instant 5% goodwill store credit voucher"
            }

        # Greetings
        if re.search(r'\b(hi|hello|hey|how are you|namaste|namaskara)\b', t):
            return {
                "ai_spoken_reply": "Hello! I am doing well, thank you. I am calling from Razorpay regarding your recent transaction. How can I assist you today?",
                "intent": "GREETING",
                "detected_language": "English",
                "willingness_to_pay": True,
                "confidence_score": 98,
                "sentiment": "Neutral",
                "payment_method": "UPI",
                "requested_date": "Immediate",
                "recommended_action": "Greeted customer and opened recovery dialogue"
            }

        return {
            "ai_spoken_reply": "Thank you for sharing that. I have noted your details and our team is assisting you with completing your transaction.",
            "intent": "GENERAL_QUERY",
            "detected_language": "English",
            "willingness_to_pay": True,
            "confidence_score": 94,
            "sentiment": "Engaged Customer",
            "payment_method": "UPI",
            "requested_date": "Immediate",
            "recommended_action": "Logged conversation and assigned priority recovery strategy"
        }

voice_agent = VoiceAgent()
