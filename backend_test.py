import requests
import sys
from datetime import datetime, timezone
import json

class BeatfluencerAPITester:
    def __init__(self, base_url="https://brandnest.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token_user=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if token_user and token_user in self.tokens:
            test_headers['Authorization'] = f'Bearer {self.tokens[token_user]}'
        elif headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2, default=str)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration for different roles"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION")
        print("="*50)
        
        test_users = [
            {
                "username": "admin_user_new",
                "email": "admin_new@test.com",
                "password": "admin123",
                "role": "admin"
            },
            {
                "username": "campaign_manager_new",
                "email": "cm_new@test.com", 
                "password": "cm123",
                "role": "campaign_manager"
            },
            {
                "username": "influencer_manager_new",
                "email": "im_new@test.com",
                "password": "im123", 
                "role": "influencer_manager"
            }
        ]
        
        for user_data in test_users:
            success, response = self.run_test(
                f"Register {user_data['role']} user",
                "POST",
                "auth/register",
                200,
                data=user_data
            )
            if success:
                self.users[user_data['role']] = user_data
                print(f"   ✅ User {user_data['email']} registered successfully")
            else:
                print(f"   ❌ Failed to register {user_data['email']}")

    def test_user_login(self):
        """Test user login for all registered users"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        for role, user_data in self.users.items():
            success, response = self.run_test(
                f"Login {role} user",
                "POST", 
                "auth/login",
                200,
                data={
                    "email": user_data["email"],
                    "password": user_data["password"]
                }
            )
            if success and 'access_token' in response:
                self.tokens[role] = response['access_token']
                print(f"   ✅ Login successful for {user_data['email']}")
                print(f"   Token: {response['access_token'][:50]}...")
            else:
                print(f"   ❌ Login failed for {user_data['email']}")

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n" + "="*50)
        print("TESTING INVALID LOGIN")
        print("="*50)
        
        # Test with wrong password
        self.run_test(
            "Login with wrong password",
            "POST",
            "auth/login", 
            401,
            data={
                "email": "admin@test.com",
                "password": "wrongpassword"
            }
        )
        
        # Test with non-existent email
        self.run_test(
            "Login with non-existent email",
            "POST",
            "auth/login",
            401, 
            data={
                "email": "nonexistent@test.com",
                "password": "password123"
            }
        )

    def test_protected_routes(self):
        """Test protected routes with JWT tokens"""
        print("\n" + "="*50)
        print("TESTING PROTECTED ROUTES")
        print("="*50)
        
        # Test /auth/me endpoint for each user
        for role in self.tokens.keys():
            self.run_test(
                f"Get current user info ({role})",
                "GET",
                "auth/me",
                200,
                token_user=role
            )
        
        # Test without token
        self.run_test(
            "Get current user info (no token)",
            "GET", 
            "auth/me",
            401
        )
        
        # Test with invalid token
        self.run_test(
            "Get current user info (invalid token)",
            "GET",
            "auth/me", 
            401,
            headers={'Authorization': 'Bearer invalid_token'}
        )

    def test_role_based_access(self):
        """Test role-based access control"""
        print("\n" + "="*50)
        print("TESTING ROLE-BASED ACCESS")
        print("="*50)
        
        # Test admin-only endpoint /users
        if 'admin' in self.tokens:
            self.run_test(
                "Get users list (admin)",
                "GET",
                "users",
                200,
                token_user='admin'
            )
        
        # Test non-admin access to admin endpoint
        if 'campaign_manager' in self.tokens:
            self.run_test(
                "Get users list (campaign_manager - should fail)",
                "GET", 
                "users",
                403,
                token_user='campaign_manager'
            )

    def test_influencer_endpoints(self):
        """Test influencer-related endpoints"""
        print("\n" + "="*50)
        print("TESTING INFLUENCER ENDPOINTS")
        print("="*50)
        
        # Test get influencers (should work for all authenticated users)
        for role in self.tokens.keys():
            self.run_test(
                f"Get influencers list ({role})",
                "GET",
                "influencers",
                200,
                token_user=role
            )
        
        # Test search influencers
        if 'admin' in self.tokens:
            self.run_test(
                "Search influencers",
                "GET",
                "search/influencers?q=test",
                200,
                token_user='admin'
            )

    def test_brand_endpoints(self):
        """Test brand-related endpoints"""
        print("\n" + "="*50)
        print("TESTING BRAND ENDPOINTS")
        print("="*50)
        
        if 'admin' in self.tokens:
            self.run_test(
                "Get brands list",
                "GET",
                "brands",
                200,
                token_user='admin'
            )

    def test_campaign_endpoints(self):
        """Test campaign-related endpoints"""
        print("\n" + "="*50)
        print("TESTING CAMPAIGN ENDPOINTS")
        print("="*50)
        
        if 'admin' in self.tokens:
            self.run_test(
                "Get campaigns list",
                "GET",
                "campaigns",
                200,
                token_user='admin'
            )

    def test_cors_and_health(self):
        """Test CORS and basic health"""
        print("\n" + "="*50)
        print("TESTING CORS AND HEALTH")
        print("="*50)
        
        # Test basic connectivity
        try:
            response = requests.get(f"{self.base_url}/docs")
            if response.status_code == 200:
                print("✅ Backend is accessible")
                print(f"   Docs URL: {self.base_url}/docs")
            else:
                print(f"❌ Backend docs not accessible: {response.status_code}")
        except Exception as e:
            print(f"❌ Backend connection failed: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Beatfluencer API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Test sequence
        self.test_cors_and_health()
        self.test_user_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_protected_routes()
        self.test_role_based_access()
        self.test_influencer_endpoints()
        self.test_brand_endpoints()
        self.test_campaign_endpoints()
        
        # Print final results
        print("\n" + "="*60)
        print("FINAL TEST RESULTS")
        print("="*60)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = BeatfluencerAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())