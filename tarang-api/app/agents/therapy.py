class TherapyPlanningAgent:
    def __init__(self):
        self.name = "Tarang Therapy Planning Agent"
        self.role = "Personalized intervention planning based on developmental gaps"

    def create_plan(self, risk_results: dict):
        """
        Suggests targeted activities based on specific multimodal flags.
        """
        behavioral_score = risk_results["breakdown"]["behavioral"]
        
        activities = []
        if behavioral_score > 60:
            activities.append({
                "title": "Joint Attention Mosaic",
                "goal": "Improve gaze shifting between child and caregiver.",
                "duration": "15 mins/day"
            })
            activities.append({
                "title": "Point & Follow",
                "goal": "Enhance response to social pointing cues.",
                "duration": "10 mins/day"
            })
        
        return {
            "plan_id": "TP-4401",
            "suggested_activities": activities,
            "focus_area": "Social Communication & Gaze",
            "next_review": "7 days"
        }
