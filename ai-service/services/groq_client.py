# This is a dummy Groq service file until AI developer 2 uploads the actual file. 
# Updated by AI Dev 1 to return a JSON string for integration testing.

class GroqClient:
    def call(self, prompt):
        # We return a JSON-formatted string so report generator 
        # can prove it knows how to parse and structure the final report.
        return """
        {
          "title": "Cybersecurity Risk Appetite Analysis",
          "executive_summary": "The organization maintains a moderate risk appetite, focusing on proactive threat detection and robust access controls.",
          "overview": "Based on the retrieved framework, the current strategy prioritizes data integrity and system availability.",
          "top_items": [
            "MFA gaps in legacy systems",
            "Unencrypted data in secondary storage",
            "Social engineering vulnerability"
          ],
          "recommendations": [
            "Implement Zero-Trust architecture",
            "Automate patch management",
            "Quarterly penetration testing"
          ]
        }
        """

groq_client = GroqClient()