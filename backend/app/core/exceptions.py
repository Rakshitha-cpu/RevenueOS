from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional

class RevenueOSBaseException(Exception):
    """Base exception for all RevenueOS domain errors."""
    def __init__(self, message: str, error_code: str = "INTERNAL_ERROR", status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class PolicyViolationException(RevenueOSBaseException):
    """Raised when an action violates deterministic stopping rules or financial limits."""
    def __init__(self, message: str, violation_type: str = "AMOUNT_CAP_EXCEEDED", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="POLICY_VIOLATION",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"violation_type": violation_type, **(details or {})}
        )

class BankNetworkDowntimeException(RevenueOSBaseException):
    """Raised when an operation targets an outage-affected banking network."""
    def __init__(self, bank: str, instrument: str = "netbanking"):
        super().__init__(
            message=f"Banking network {bank} is currently experiencing degraded connectivity.",
            error_code="BANK_DOWNTIME",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"bank": bank, "instrument": instrument, "auto_rerouted": True, "alternative": "UPI_INTENT"}
        )

class InvalidWebhookSignatureException(RevenueOSBaseException):
    """Raised when incoming Razorpay HMAC SHA-256 signature verification fails."""
    def __init__(self, message: str = "Cryptographic webhook HMAC signature verification failed."):
        super().__init__(
            message=message,
            error_code="INVALID_WEBHOOK_SIGNATURE",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details={"security_layer": "HMAC-SHA256"}
        )

class RateLimitExceededException(RevenueOSBaseException):
    """Raised when customer outreach rate limits are exceeded."""
    def __init__(self, customer_id: str, limit: int = 3):
        super().__init__(
            message=f"Customer {customer_id} has exceeded maximum outreach limit of {limit} contacts per 24 hours.",
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details={"customer_id": customer_id, "max_limit_24h": limit}
        )

class ResourceNotFoundException(RevenueOSBaseException):
    """Raised when a transaction, risk record, or customer cannot be located."""
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} with ID '{resource_id}' was not found.",
            error_code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource_type": resource_type, "resource_id": resource_id}
        )

async def revenueos_exception_handler(request: Request, exc: RevenueOSBaseException):
    """Global JSON exception handler converting domain exceptions to structured client responses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "path": str(request.url.path)
            }
        }
    )
