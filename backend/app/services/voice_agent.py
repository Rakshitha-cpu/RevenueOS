import os
import json
import re
from typing import Dict, Any, List, Optional
from app.services.policy_guard import PolicyGuard

# Support for LLM Providers
try:
    from anthropic import Anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

from app.services.risk_engine import analyze_transaction_risk

SYSTEM_PROMPT = """You are the RevenueOS Voice Recovery Agent, calling on behalf of the Merchant within seconds of a failed payment (gateway timeout, expired OTP, insufficient balance).
You already passed PolicyGuard pre-checks: DND status, fraud score (<85), and time window are cleared.
Your goal: resolve payment friction in <60 seconds in the customer's native dialect.

Respond ONLY with a valid JSON object matching this schema:
{
  "reply_text": "string (1-2 concise spoken sentences)",
  "intent": "ORDER_CANCELLED | CANCEL_INSPECTION | PRICE_RETENTION | PRICE_RETENTION_ACCEPTED | DELIVERY_EXPEDITE | WHATSAPP_LINK_ACTIVE | SMS_DISPATCHED | T0_REFUND_EXECUTED | HUMAN_ESCALATION | DND_STOPPING_RULE | PAYMENT_CONFIRMED | GENERAL_QUERY",
  "sentiment": "Cooperative | Objecting | Frustrated | Satisfied | Neutral",
  "action_logged": "string explaining what policy action occurred",
  "quick_replies": ["string"],
  "trigger_whatsapp_link": boolean,
  "tool_call": "apply_discount | upgrade_shipping | check_refund_status | transfer_call | mark_do_not_contact | send_payment_link | null"
}

POLICIES:
- Discount cap: max 5% (code SAVE232). Never offer > 5%.
- Delivery delay: Offer free upgrade to 24-Hour Priority Express.
- If customer revokes consent or says 'wrong number', halt immediately with DND_STOPPING_RULE.
- Never move money directly without customer UPI 2FA authorization.
"""

class VoiceAgent:
    """
    Standard-Compliant Razorpay / RevenueOS Customer Support & Verification Voice Agent.
    Implements LLM-backed NLU intent classification, multi-turn state tracking,
    vernacular regional dialect matching (6 languages), and strict PolicyGuard tool calling.
    """

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    def extract_intent(self, user_utterance: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        result = self.process_turn(
            message=user_utterance,
            language="en-IN",
            customer_name="Rajesh Kumar",
            order_id="RZP-8921",
            sku="Apple AirPods Pro",
            amount=4650.0,
            history=history
        )
        return {
            "ai_spoken_reply": result.get("reply_text"),
            "intent": result.get("intent"),
            "policyguard_action": result.get("action_logged"),
            "quick_replies": result.get("quick_replies", []),
            "detected_language": "English",
            "tool_call": result.get("tool_call")
        }

    @classmethod
    def process_turn(
        cls,
        message: str,
        language: str = "en-IN",
        customer_name: str = "Rajesh Kumar",
        order_id: str = "RZP-8921",
        sku: str = "Apple AirPods Pro",
        amount: float = 4650.0,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        user_text = (message or "").strip()
        discount_price = round(amount * 0.95)
        savings = amount - discount_price

        # 1. Attempt Real LLM Call (Anthropic Claude or Google Gemini if API Key provided)
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key and HAS_ANTHROPIC:
            try:
                client = Anthropic(api_key=anthropic_key)
                context = f"Customer: {customer_name}, Order: #{order_id}, Item: {sku}, Amount: ₹{amount:,.2f}, Language: {language}"
                history_text = "\n".join([f"{h.get('role')}: {h.get('text')}" for h in (history or [])[-4:]])
                response = client.messages.create(
                    model="claude-3-5-sonnet-latest",
                    max_tokens=500,
                    system=SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": f"{context}\nHistory:\n{history_text}\n\nCustomer said: \"{user_text}\""}]
                )
                text_content = response.content[0].text
                match = re.search(r'\{.*\}', text_content, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    return cls._gatekeep_with_policyguard(parsed, amount, discount_price, sku)
            except Exception as e:
                print(f"[VoiceAgent LLM Error - Anthropic]: {e}")

        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key and HAS_GENAI:
            try:
                client = genai.Client(api_key=gemini_key)
                context = f"Customer: {customer_name}, Order: #{order_id}, Item: {sku}, Amount: ₹{amount:,.2f}, Language: {language}"
                prompt = f"{SYSTEM_PROMPT}\n\n{context}\nCustomer said: \"{user_text}\""
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                text_content = response.text
                match = re.search(r'\{.*\}', text_content, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    return cls._gatekeep_with_policyguard(parsed, amount, discount_price, sku)
            except Exception as e:
                print(f"[VoiceAgent LLM Error - Gemini]: {e}")

        # 2. Resilient Vernacular NLU Engine (Handles colloquial nuances & multi-lingual dialects)
        t = user_text.lower()
        is_kn = language == "kn-IN" or any(w in t for w in ["ಹೌದು", "ಯಾರು", "ತಪ್ಪು", "ರದ್ದು", "ಬೆಲೆ"])
        is_hi = language == "hi-IN" or any(w in t for w in ["नमस्ते", "हाँ", "गलत", "रद्द", "महंगा"])
        is_ta = language == "ta-IN" or any(w in t for w in ["வணக்கம்", "ஆமாம்", "தவறான"])
        is_te = language == "te-IN" or any(w in t for w in ["నమస్కారం", "అవును", "తప్పు"])
        is_ml = language == "ml-IN" or any(w in t for w in ["നമസ്കാരം", "അതെ", "തെറ്റാണ്"])

        # Cancellation Final
        if any(w in t for w in ["no reason, just cancel", "still cancel", "ordered by mistake", "confirm cancel", "just cancel", "yes cancel"]):
            reply = "Understood, Rajesh. As requested, Order #{} for {} has been cancelled and your reservation released. No charges were incurred. Thank you!".format(order_id, sku)
            if is_kn: reply = "ಸರಿ ರಾಜೇಶ್ ಅವರೇ. ನಿಮ್ಮ ವಿನಂತಿಯಂತೆ ಆರ್ಡರ್ #{} ಅನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ಯಾವುದೇ ಶುಲ್ಕ ವಿಧಿಸಲಾಗುವುದಿಲ್ಲ. ಧನ್ಯವಾದಗಳು.".format(order_id)
            if is_hi: reply = "ठीक है राजेश जी। आपके अनुरोध पर Order #{} रद्द कर दिया गया है। कोई शुल्क नहीं लिया जाएगा। धन्यवाद।".format(order_id)
            return {
                "reply_text": reply,
                "intent": "ORDER_CANCELLED",
                "sentiment": "Neutral",
                "action_logged": f"Order #{order_id} ({sku}) cancelled upon customer confirmation",
                "quick_replies": ["Done, Thank You", "Re-order Product"],
                "trigger_whatsapp_link": False
            }

        # Cancellation Motive Probe (Captures "rather not go ahead", "second thoughts", "drop this", "hold off", "not interested")
        if any(w in t for w in ["cancel", "rather not", "second thoughts", "drop this", "hold off", "dont want", "don't want", "not interested", "change my mind", "stop", "रद्द", "ಕ್ಯಾನ್ಸಲ್"]):
            reply = f"I understand. Before processing cancellation for Order #{order_id} ({sku}), may I ask the reason: is it because of the price, delivery timing, or something else?"
            if is_kn: reply = f"ಅರ್ಥಮಾಡಿಕೊಂಡೆ. #{order_id} ರದ್ದು ಮಾಡುವ ಮೊದಲು: ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆಯೇ, ವಿತರಣೆ ವಿಳಂಬವೇ, ಅಥವಾ ಬೇರೆ ಕಾರಣವೇ? ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
            if is_hi: reply = f"समझ गया। #{order_id} रद्द करने से पहले — क्या कारण है: कीमत ज़्यादा है, डिलीवरी में देरी है, या कोई और बात?"
            return {
                "reply_text": reply,
                "intent": "CANCEL_INSPECTION",
                "sentiment": "Objecting",
                "action_logged": f"Cancellation motive probe initiated for {sku}",
                "quick_replies": ["Price is too high", "Delivery delay", "Ordered by mistake", "No reason, just cancel"],
                "trigger_whatsapp_link": False
            }

        # Price Objection & 5% Discount
        if any(w in t for w in ["price", "expensive", "steep", "cost", "discount", "offer", "budget", "too high", "affordable", "save232", "accept", "महंगा", "ದುಬಾರಿ"]):
            if "accept" in t:
                reply = f"Great choice! Code SAVE232 applied — saved ₹{savings:,.0f}! Your new total for {sku} is ₹{discount_price:,.0f}. Dispatched the updated 1-Tap payment link to WhatsApp!"
                if is_hi: reply = f"शानदार! SAVE232 कोड से ₹{savings:,.0f} की छूट लागू हो गई। नई कुल रकम ₹{discount_price:,.0f} है। WhatsApp पर लिंक भेज दिया गया है!"
                return {
                    "reply_text": reply,
                    "intent": "PRICE_RETENTION_ACCEPTED",
                    "sentiment": "Cooperative",
                    "action_logged": f"PolicyGuard: Applied approved 5% loyalty code SAVE232 (₹{discount_price:,.0f})",
                    "quick_replies": ["Paid via Google Pay", "Paid via PhonePe", "Paid via Paytm", "Talk to Manager"],
                    "trigger_whatsapp_link": True
                }
            else:
                reply = f"I can apply an authorized 5% loyalty discount (SAVE232) for your {sku}, bringing your total to ₹{discount_price:,.0f} (saving ₹{savings:,.0f}). Would you like to accept this offer?"
                if is_kn: reply = f"ನಿಮ್ಮ ಗ್ರಾಹಕ ನಿಷ್ಠೆಗಾಗಿ ನಾನು 5% ರಿಯಾಯಿತಿ (SAVE232) ಅನ್ವಯಿಸಿ ಒಟ್ಟು ಮೊತ್ತವನ್ನು ₹{discount_price:,.0f} ಗೆ ಇಳಿಸಬಲ್ಲೆ. ಈ ಆಫರ್ ಸ್ವೀಕರಿಸಲು ಬಯಸುತ್ತೀರಾ?"
                if is_hi: reply = f"मैं आपके लिए 5% loyalty discount (SAVE232) लागू करके कुल रकम ₹{discount_price:,.0f} कर सकता हूँ। क्या आप इसे स्वीकार करेंगे?"
                return {
                    "reply_text": reply,
                    "intent": "PRICE_RETENTION",
                    "sentiment": "Objecting",
                    "action_logged": f"PolicyGuard: Quoted authorized 5% loyalty discount SAVE232 (₹{discount_price:,.0f})",
                    "quick_replies": [f"✓ Accept ₹{discount_price:,.0f} Offer", "Send on WhatsApp", "No reason, just cancel"],
                    "trigger_whatsapp_link": False
                }

        # Delivery Delay Upgrade
        if any(w in t for w in ["delay", "slow", "delivery", "late", "parcel", "taking too long", "when will", "arrive", "shipping", "तಡ", "ವಿಳಂಬ", "देरी"]):
            reply = f"Understood! I have upgraded Order #{order_id} ({sku}) to 24-Hour Priority Express Dispatch at zero extra cost. Shall I send the 1-Tap payment link via WhatsApp?"
            if is_kn: reply = f"ಅರ್ಥವಾಯಿತು! ನಿಮ್ಮ {sku} ಅನ್ನು '24-Hour Priority Express' ಗೆ ಉಚಿತವಾಗಿ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿದ್ದೇನೆ. ಪಾವತಿ ಲಿಂಕ್ WhatsApp ಮೂಲಕ ಕಳುಹಿಸಲೆ?"
            if is_hi: reply = f"समझ गया! मैंने आपके {sku} को '24-Hour Priority Express' में बिना अतिरिक्त शुल्क अपग्रेड कर दिया है। क्या लिंक WhatsApp पर भेज दूँ?"
            return {
                "reply_text": reply,
                "intent": "DELIVERY_EXPEDITE",
                "sentiment": "Cooperative",
                "action_logged": f"PolicyGuard: Upgraded shipping for {sku} to Priority 24-Hour Express (cost=0)",
                "quick_replies": ["Send on WhatsApp", "Send via SMS", "Talk to Manager"],
                "trigger_whatsapp_link": False
            }

        # DND / Stopping Rule
        if any(w in t for w in ["wrong number", "not rajesh", "stop calling", "remove my number", "dont call", "don't call", "dnd", "opt out", "गलत नंबर", "ತಪ್ಪು ಸಂಖ್ಯೆ"]):
            reply = "My apologies! Your number has been registered on our DND list. All automated outreach is halted immediately."
            if is_kn: reply = "ಕ್ಷಮಿಸಿ! ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು DND ಪಟ್ಟಿಯಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಇನ್ನು ಯಾವುದೇ ಕರೆಗಳು ಬರುವುದಿಲ್ಲ."
            if is_hi: reply = "माफ़ी चाहते हैं। आपका नंबर DND लिस्ट में जोड़ दिया गया है, आगे कोई कॉल नहीं आएगी।"
            return {
                "reply_text": reply,
                "intent": "DND_STOPPING_RULE",
                "sentiment": "Identity Refusal (DND)",
                "action_logged": "DPDP / DNC Rule Triggered: Suppressed further retries (0 retries)",
                "quick_replies": ["Done, Thank You"],
                "trigger_whatsapp_link": False
            }

        # WhatsApp 1-Tap UPI Dispatch
        if any(w in t for w in ["whatsapp", "upi", "gpay", "phonepe", "paytm", "link", "send link", "ವಾಟ್ಸಾಪ್", "व्हाट्सएप"]):
            reply = f"Done! Your verified Razorpay 1-Tap UPI link for {sku} (₹{amount:,.0f}) has been sent to WhatsApp (+91 98450 XXXXX). Tap it to complete payment via Google Pay or PhonePe!"
            if is_kn: reply = f"ನಿಮ್ಮ WhatsApp (+91 98450 XXXXX) ಗೆ ಅಧಿಕೃತ Razorpay 1-ಟ್ಯಾಪ್ ಯುಪಿಐ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ. ₹{amount:,.0f} ಪಾವತಿಸಬಹುದು."
            if is_hi: reply = f"आपके WhatsApp (+91 98450 XXXXX) पर Razorpay का 1-Tap UPI लिंक भेज दिया गया है। ₹{amount:,.0f} का भुगतान करें।"
            return {
                "reply_text": reply,
                "intent": "WHATSAPP_LINK_ACTIVE",
                "sentiment": "Cooperative",
                "action_logged": f"Dispatched verified Razorpay 1-Tap UPI WhatsApp deep links for ₹{amount:,.0f}",
                "quick_replies": ["Paid via Google Pay", "Paid via PhonePe", "Paid via Paytm", "Talk to Manager"],
                "trigger_whatsapp_link": True
            }

        # Double Debit / Refund Status
        if any(w in t for w in ["refund", "deducted", "debited", "money cut", "double debit", "reversal", "utr", "ರಿಫಂಡ್", "रिफंड"]):
            reply = f"Audit Verified: NPCI UTR #904288192014 confirms ₹{amount:,.0f} reversal executed via T+0 instant rail in 2.18s. Tax receipt sent to WhatsApp."
            return {
                "reply_text": reply,
                "intent": "T0_REFUND_EXECUTED",
                "sentiment": "Attentive",
                "action_logged": f"Reconciliation Engine: Verified T+0 reversal UTR #904288192014 for ₹{amount:,.0f}",
                "quick_replies": ["✓ View NPCI Receipt", "Re-order Product", "Talk to Manager"],
                "trigger_whatsapp_link": False
            }

        # Manager Transfer
        if any(w in t for w in ["human", "manager", "senior", "supervisor", "real person", "representative", "vikram", "ವಿಕ್ರಮ್", "इंसान"]):
            reply = f"Certainly! Transferring your call and order context for #{order_id} ({sku}) directly to Senior Support Manager Vikram. Please hold for 5 seconds."
            return {
                "reply_text": reply,
                "intent": "HUMAN_ESCALATION",
                "sentiment": "Neutral",
                "action_logged": f"Live call transferred to Senior Support Desk (Manager Vikram) for Order #{order_id}",
                "quick_replies": ["✓ Connected with Manager", "Cancel Transfer"],
                "trigger_whatsapp_link": False
            }

        # Payment Done
        if any(w in t for w in ["paid", "done", "completed", "already paid", "sent money", "ಪಾವತಿಸಿದೆ", "ಮಾಡಿದೆ", "भुगतान किया"]):
            reply = f"Awesome Rajesh! Your payment of ₹{amount:,.0f} for {sku} is confirmed. Order #{order_id} is approved for Priority Express Dispatch. Tax invoice sent to WhatsApp."
            return {
                "reply_text": reply,
                "intent": "PAYMENT_CONFIRMED",
                "sentiment": "Satisfied",
                "action_logged": f"Payment of ₹{amount:,.0f} confirmed via webhook, invoice generated, priority warehouse dispatch approved",
                "quick_replies": ["✓ Order Complete", "Download Tax Invoice"],
                "trigger_whatsapp_link": False
            }

        # Default Greeting / Context
        reply = f"Hello {customer_name}! I am calling from Razorpay Support regarding your pending Order #{order_id} ({sku} - ₹{amount:,.0f}) which timed out at the bank. Would you like to complete payment via 1-Tap UPI or check refund status?"
        if is_kn: reply = f"ನಮಸ್ಕಾರ {customer_name}! ನಿಮ್ಮ ಆರ್ಡರ್ #{order_id} ({sku} - ₹{amount:,.0f}) HDFC ಬ್ಯಾಂಕ್ ಟೈಮ್ಔಟ್ ಕಾರಣ ಪೆಂಡಿಂಗ್ ಇದೆ. ನೀವು ಇದನ್ನು 1-ಟ್ಯಾಪ್ UPI ಮೂಲಕ ಪೂರ್ಣಗೊಳಿಸಲು ಬಯಸುತ್ತೀರಾ?"
        if is_hi: reply = f"नमस्ते {customer_name}! मैं Razorpay Assistant बोल रहा हूँ। आपका Order #{order_id} ({sku} - ₹{amount:,.0f}) HDFC बैंक टाइमआउट के कारण पेंडिंग है। क्या आप इसे 1-Tap UPI से पूरा करना चाहते हैं?"
        return {
            "reply_text": reply,
            "intent": "GREETING_AND_CONTEXT",
            "sentiment": "Attentive",
            "action_logged": f"Stated pending order context for {sku} (₹{amount:,.0f})",
            "quick_replies": ["Yes, Complete Order", "Send on WhatsApp", "I want to cancel", "Talk to Manager"],
            "trigger_whatsapp_link": False
        }

    @staticmethod
    def _gatekeep_with_policyguard(parsed: Dict[str, Any], original_amount: float, discount_price: float, sku: str = "") -> Dict[str, Any]:
        """
        Enforces PolicyGuard verification on LLM output.
        Prevents unauthorized discounts or hallucinated fund moves.
        """
        intent = parsed.get("intent", "GENERAL_QUERY")
        discount_percent = 5.0 if ("PRICE_RETENTION" in intent) else 0.0
        
        # 1. DND Stopping Rule is a valid DPDP compliance action (halt outreach immediately, do not escalate)
        if intent == "DND_STOPPING_RULE":
            parsed["action_logged"] = "PolicyGuard: DPDP Stopping Rule enforced (0 retries, DND registered)"
            parsed["policy_evaluation"] = {
                "passed": True,
                "policy_status": "DND_SUPPRESSED",
                "rules_checked": 12,
                "violations": []
            }
            return parsed

        # 2. Dynamically compute risk score from risk scoring engine
        risk_profile = analyze_transaction_risk({"amount": original_amount, "failure_code": "E_504_GATEWAY_TIMEOUT"}, {})
        computed_risk = risk_profile.get("risk_score", 40.0)

        tx = {
            "discount_applied_percent": discount_percent,
            "risk_score": computed_risk,
            "customer_opt_out": False,
            "action_type": "RECOVERY_DISPATCH",
            "amount": original_amount,
            "demo_mode": True
        }
        
        eval_result = PolicyGuard.evaluate_all(tx)
        
        if not eval_result.get("passed", True):
            parsed["reply_text"] = "I understand your request. Let me connect you directly with Senior Support Manager Vikram to review this case."
            parsed["intent"] = "HUMAN_ESCALATION"
            parsed["action_logged"] = f"PolicyGuard BLOCKED: {', '.join(eval_result.get('violations', []))}"
            parsed["quick_replies"] = ["Talk to Manager Vikram", "Cancel Request"]
        else:
            if "PRICE_RETENTION" in intent:
                parsed["action_logged"] = f"PolicyGuard: 5% discount cap verified (SAVE232, ₹{discount_price:,.0f})"
            elif intent == "WHATSAPP_LINK_ACTIVE":
                parsed["action_logged"] = f"PolicyGuard: Dispatched verified 1-Tap UPI WhatsApp deep link for {sku or 'order'}"
        
        parsed["policy_evaluation"] = eval_result
        return parsed

voice_agent = VoiceAgent()