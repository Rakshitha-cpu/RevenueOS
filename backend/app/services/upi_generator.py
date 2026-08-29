import urllib.parse
from typing import Dict, Any

class UPIDeepLinkGenerator:
    """
    Phase 12: UPI Deep Link & Dynamic QR Code Generator.
    Turns failed card and netbanking checkouts into instant, 1-tap UPI app intents
    (supporting Google Pay, PhonePe, Paytm, and BHIM).
    """

    def __init__(self, default_vpa: str = "merchant@razorpay", merchant_name: str = "RevenueOS Store"):
        self.default_vpa = default_vpa
        self.merchant_name = merchant_name

    def generate_intent(
        self, 
        amount: float, 
        transaction_ref: str, 
        note: str = "Payment Recovery via RevenueOS",
        vpa: str = None
    ) -> Dict[str, Any]:
        """
        Generates standard NPCI compliant UPI Intent URI and app-specific deep links.
        """
        payee_vpa = vpa or self.default_vpa
        formatted_amount = f"{amount:.2f}"
        encoded_name = urllib.parse.quote(self.merchant_name)
        encoded_note = urllib.parse.quote(note)
        encoded_ref = urllib.parse.quote(transaction_ref)

        # Standard NPCI UPI URI
        upi_uri = (
            f"upi://pay?pa={payee_vpa}"
            f"&pn={encoded_name}"
            f"&tr={encoded_ref}"
            f"&am={formatted_amount}"
            f"&cu=INR"
            f"&tn={encoded_note}"
        )

        return {
            "status": "success",
            "amount": amount,
            "currency": "INR",
            "reference_id": transaction_ref,
            "upi_intent_uri": upi_uri,
            "app_deep_links": {
                "gpay": f"tez://upi/pay?pa={payee_vpa}&pn={encoded_name}&am={formatted_amount}&cu=INR&tr={encoded_ref}",
                "phonepe": f"phonepe://pay?pa={payee_vpa}&pn={encoded_name}&am={formatted_amount}&cu=INR&tr={encoded_ref}",
                "paytm": f"paytmmp://pay?pa={payee_vpa}&pn={encoded_name}&am={formatted_amount}&cu=INR&tr={encoded_ref}"
            },
            "qr_payload": upi_uri,
            "message": "1-Tap UPI Intent and App Deep Links generated successfully."
        }

upi_generator = UPIDeepLinkGenerator()
