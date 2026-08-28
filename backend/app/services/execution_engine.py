import os
import uuid

try:
    import razorpay
    HAS_RAZORPAY = True
except ImportError:
    HAS_RAZORPAY = False

class RazorpayExecutionAdapter:
    """
    Agent Action Executor for generating Razorpay Payment Links.
    If actual API keys are provided in .env, it makes a live API call.
    Otherwise, it securely falls back to a simulated sandbox response.
    """
    
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        self.key_id = os.getenv("RAZORPAY_KEY_ID")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        
        if self.key_id and self.key_secret and HAS_RAZORPAY:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        else:
            self.client = None

    def execute_payment_link(self, amount: float, customer_name: str, customer_email: str, customer_phone: str, reference_id: str = None) -> dict:
        if not reference_id:
            reference_id = f"RR-{str(uuid.uuid4())[:8]}"
            
        amount_in_paise = int(amount * 100)

        # LIVE RAZORPAY API CALL
        if self.client:
            try:
                payment_link = self.client.payment_link.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "accept_partial": False,
                    "description": "RevenueOS Recovery Payment",
                    "customer": {
                        "name": customer_name or "Valued Customer",
                        "email": customer_email or "test@example.com",
                        "contact": customer_phone or "+919999999999"
                    },
                    "notify": {
                        "sms": True,
                        "email": True
                    },
                    "reminder_enable": True,
                    "reference_id": reference_id
                })
                return {
                    "status": "success",
                    "mocked": False,
                    "payment_link_id": payment_link.get("id"),
                    "payment_url": payment_link.get("short_url"),
                    "message": "Live Razorpay link generated."
                }
            except Exception as e:
                return {"status": "error", "mocked": False, "message": str(e)}

        # DETERMINISTIC SIMULATED FALLBACK
        return {
            "status": "success",
            "mocked": True,
            "payment_link_id": f"plink_sim_{reference_id}",
            "payment_url": f"https://rzp.io/i/simulated_{reference_id}",
            "message": "[SIMULATED PAYMENT ENVIRONMENT] No API keys detected. Generating mock link."
        }
