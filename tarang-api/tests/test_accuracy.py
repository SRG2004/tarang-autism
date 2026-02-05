import sys
import os
import unittest
import numpy as np

# Add app to path
sys.path.append(os.path.join(os.getcwd(), 'tarang-api'))

from app.agents.screening import ScreeningAgent
from app.agents.outcome import OutcomeAgent

class TestTarangAccuracy(unittest.TestCase):
    def setUp(self):
        self.screening_agent = ScreeningAgent()
        self.outcome_agent = OutcomeAgent()

    def test_screening_accuracy(self):
        """
        Benchmarking Screening Agent against clinical synthetic profiles.
        """
        test_cases = [
            # Case 1: High Risk Profile (Classic ASD markers)
            {
                "input": {"video": {"eye_contact": 0.85, "motor_coordination": 0.9}, "q": 16}, # q_norm 0.8
                "expected": "High Risk",
                "label": "High Risk (V:0.85, Q:0.8)"
            },
            # Case 2: Low Risk Profile (Typical Development)
            {
                "input": {"video": {"eye_contact": 0.1, "motor_coordination": 0.15}, "q": 2}, # q_norm 0.1
                "expected": "Low Risk",
                "label": "Low Risk (V:0.1, Q:0.1)"
            },
            # Case 3: Moderate Risk (Borderline signals)
            {
                "input": {"video": {"eye_contact": 0.5, "motor_coordination": 0.5}, "q": 10}, # q_norm 0.5
                "expected": "Moderate Risk",
                "label": "Moderate Risk (V:0.5, Q:0.5)"
            },
            # Case 4: High Discrepancy (Vision says high, Q says low)
            # Should be Moderate Risk with Low Confidence due to safety damping
            {
                "input": {"video": {"eye_contact": 0.9, "motor_coordination": 0.9}, "q": 2}, # q_norm 0.1, dissonance 0.8
                "expected": "Moderate Risk",
                "label": "Dissonant Profile (Safety Damping)"
            }
        ]

        correct = 0
        print("\n--- Screening Agent Accuracy Report ---")
        for case in test_cases:
            result = self.screening_agent.analyze_signals(case["input"]["video"], case["input"]["q"])
            passed = result["interpretation"] == case["expected"]
            if passed:
                correct += 1
            status = "PASS" if passed else "FAIL"
            print(f"[{status}] {case['label']} -> Got: {result['interpretation']} (Score: {result['risk_score']}%, Conf: {result['confidence']})")

        accuracy = (correct / len(test_cases)) * 100
        print(f"\nFinal Screening Accuracy: {accuracy}%")
        self.assertGreaterEqual(accuracy, 75)

    def test_outcome_accuracy(self):
        """
        Benchmarking Outcome Agent against trajectory trends.
        """
        test_cases = [
            # Case 1: Improving Trajectory
            {
                "scores": [30, 35, 42, 48, 55],
                "expected": "Improving",
                "label": "Upward Trend"
            },
            # Case 2: Regressing Trajectory
            {
                "scores": [60, 58, 52, 45, 38],
                "expected": "Regressing",
                "label": "Downward Trend"
            },
            # Case 3: Plateaued
            {
                "scores": [45, 46, 45, 44, 45],
                "expected": "Plateaued",
                "label": "Stable Trend"
            }
        ]

        correct = 0
        print("\n--- Outcome Agent Accuracy Report ---")
        for case in test_cases:
            result = self.outcome_agent.predict_trajectory(case["scores"])
            passed = case["expected"] in result["trend"]
            if passed:
                correct += 1
            status = "PASS" if passed else "FAIL"
            print(f"[{status}] {case['label']} -> Got: {result['trend']} (Velocity: {result['velocity']}, Conf: {result['confidence_interval']})")

        accuracy = (correct / len(test_cases)) * 100
        print(f"\nFinal Outcome Accuracy: {accuracy}%")
        self.assertGreaterEqual(accuracy, 100)

if __name__ == '__main__':
    unittest.main()
