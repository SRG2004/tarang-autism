from typing import List, Dict

class SocialAgent:
    """
    AI Social Concierge for TARANG Community Hub.
    Handles moderation, sentiment analysis, and resource matching for parents.
    """
    
    def moderate_content(self, text: str) -> Dict:
        """
        Industrial safety filter for pediatric community hub.
        """
        # Simulated sensitive word check (Pediatric Safety focus)
        forbidden = ["cure", "guaranteed", "scam", "treatment for sale"]
        violations = [w for w in forbidden if w in text.lower()]
        
        return {
            "safe": len(violations) == 0,
            "violations": violations,
            "action": "FLAG_FOR_MODERATION" if violations else "ALLOW"
        }

    def match_resources(self, parent_query: str) -> List[Dict]:
        """
        Matches parent queries to internal clinical resources or local groups.
        """
        knowledge_base = [
            {"topic": "Sleep Hygiene", "link": "/resources/sleep", "tags": ["rest", "routine"]},
            {"topic": "Sensory Play", "link": "/resources/sensory", "tags": ["activity", "tactile"]},
            {"topic": "Parent Burnout", "link": "/groups/caregivers", "tags": ["mental health", "support"]}
        ]
        
        matches = [r for r in knowledge_base if any(t in parent_query.lower() for t in r["tags"])]
        return matches or knowledge_base[:1]
