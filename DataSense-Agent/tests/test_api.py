import unittest
import json
from flask_api import app

class TestDataSenseFlaskAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "healthy")
        self.assertIn("Swapna V", data["developer"])

    def test_profile_endpoint(self):
        response = self.client.post("/profile")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")

    def test_analyze_endpoint(self):
        payload = {"question": "Which region has highest sales?"}
        response = self.client.post(
            "/analyze",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")
        self.assertIn("answer", data)

if __name__ == "__main__":
    unittest.main()
