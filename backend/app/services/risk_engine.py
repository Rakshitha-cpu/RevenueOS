def analyze_transaction_risk(transaction_data: dict, customer_data: dict) -> dict:
    """
    Deterministic Risk Scoring Engine.
    For the hackathon MVP, this evaluates basic transaction attributes 
    to output a reliable and explainable risk score instead of a heavy ML model.
    """
    amount = transaction_data.get("amount", 0.0)
    failure_code = transaction_data.get("failure_code", "UNKNOWN")
    
    base_risk = 50.0
    recoverability = 50.0
    reasons = []

    # Apply failure code heuristics
    if failure_code == "CARD_DECLINED":
        base_risk += 35
        recoverability += 25
        reasons.append("CARD_FAILURE")
    elif failure_code == "ABANDONED":
        base_risk += 20
        recoverability += 35
        reasons.append("CHECKOUT_ABANDONMENT")
    elif failure_code == "OVERDUE":
        base_risk += 40
        recoverability -= 15
        reasons.append("INVOICE_OVERDUE")
    elif failure_code == "RENEWAL_FAILED":
        base_risk += 25
        recoverability += 20
        reasons.append("SUBSCRIPTION_LAPSE")
        
    # Apply amount heuristics
    if amount > 10000:
        base_risk += 15
        recoverability -= 10
        reasons.append("HIGH_VALUE_AT_RISK")
    elif amount < 1000:
        base_risk -= 10
        recoverability += 10
        reasons.append("LOW_VALUE_FRICTION")
        
    # Bound the scores between 0 and 100
    risk_score = min(max(base_risk, 0), 100)
    recoverability_score = min(max(recoverability, 0), 100)
    loss_probability = risk_score / 100.0

    return {
        "risk_type": failure_code.lower(),
        "risk_score": round(risk_score, 2),
        "loss_probability": round(loss_probability, 2),
        "amount_at_risk": amount,
        "recoverability_score": round(recoverability_score, 2),
        "reason_codes": reasons
    }
