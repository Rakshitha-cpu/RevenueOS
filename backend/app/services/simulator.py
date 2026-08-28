from typing import List, Dict, Any

class ImpactSimulator:
    """
    Phase 6: What-If Simulator Engine.
    Simulates the outcome of various recovery strategies by calculating the 
    expected recovery and applying penalties for customer friction and risk.
    """
    
    def compare_strategies(self, strategies: List[Dict[str, Any]]) -> Dict[str, Any]:
        ranked_strategies = []
        
        for strategy in strategies:
            expected_recovery = strategy.get("expected_recovery", 0.0)
            friction = strategy.get("friction", "Low").lower()
            risk = strategy.get("risk", "Low").lower()
            
            # 1. Apply Friction Penalty
            # High friction (like multiple phone calls) reduces the net score
            friction_penalty = 0
            if friction == "medium":
                friction_penalty = expected_recovery * 0.05
            elif friction == "high":
                friction_penalty = expected_recovery * 0.15
                
            # 2. Apply Risk Penalty
            # High risk actions (like forced retries) reduce the net score
            risk_penalty = 0
            if risk == "medium":
                risk_penalty = expected_recovery * 0.10
            elif risk == "high":
                risk_penalty = expected_recovery * 0.25
                
            # 3. Calculate Final Net Score
            score = expected_recovery - friction_penalty - risk_penalty
            
            ranked_strategies.append({
                **strategy,
                "friction_penalty": round(friction_penalty, 2),
                "risk_penalty": round(risk_penalty, 2),
                "net_score": round(score, 2)
            })
            
        # Sort strategies by net score in descending order
        ranked_strategies.sort(key=lambda x: x["net_score"], reverse=True)
        
        best_strategy = ranked_strategies[0] if ranked_strategies else None
        
        return {
            "recommended_strategy": best_strategy.get("strategy") if best_strategy else None,
            "expected_recovery": best_strategy.get("expected_recovery") if best_strategy else 0.0,
            "net_score": best_strategy.get("net_score") if best_strategy else 0.0,
            "reason": f"Produces the highest net score ({best_strategy.get('net_score') if best_strategy else 0}) after accounting for friction and risk penalties.",
            "ranked_options": ranked_strategies
        }

simulator_engine = ImpactSimulator()
