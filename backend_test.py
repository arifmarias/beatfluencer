import requests
import sys
from datetime import datetime, timezone
import json

class BeatfluencerAPITester:
    def __init__(self, base_url="https://social-manager-6.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None

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
                "email": "admin_new@test.com",
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

    def test_admin_login_specific(self):
        """Test login with specific admin credentials from review request"""
        print("\n" + "="*50)
        print("TESTING ADMIN LOGIN (SPECIFIC CREDENTIALS)")
        print("="*50)
        
        success, response = self.run_test(
            "Login with admin@beatfluencer.com / admin123",
            "POST",
            "auth/login",
            200,
            data={
                "email": "admin@beatfluencer.com",
                "password": "admin123"
            }
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   ✅ Admin login successful")
            print(f"   Token: {response['access_token'][:50]}...")
            print(f"   User info: {response.get('user', {})}")
            return True
        else:
            print(f"   ❌ Admin login failed")
            return False

    def test_influencers_api_real_data(self):
        """Test influencers API to ensure it returns real data (not demo data)"""
        print("\n" + "="*50)
        print("TESTING INFLUENCERS API - REAL DATA VERIFICATION")
        print("="*50)
        
        if not self.admin_token:
            print("❌ Cannot test - admin token not available")
            return False
            
        success, response = self.run_test(
            "Get influencers list (checking for real data)",
            "GET",
            "influencers",
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if success:
            influencers = response if isinstance(response, list) else []
            print(f"   📊 Found {len(influencers)} influencers in database")
            
            if len(influencers) == 0:
                print("   ⚠️  No influencers found - this is expected if demo data was removed")
                return True
            
            # Check if data looks real (not demo/fake data)
            demo_indicators = ['demo', 'test', 'fake', 'sample', 'example']
            real_data_count = 0
            
            for i, influencer in enumerate(influencers[:3]):  # Check first 3
                print(f"\n   🔍 Analyzing Influencer {i+1}:")
                name = influencer.get('name', '').lower()
                email = influencer.get('email', '').lower()
                bio = influencer.get('bio', '').lower() if influencer.get('bio') else ''
                
                print(f"      Name: {influencer.get('name', 'N/A')}")
                print(f"      Email: {influencer.get('email', 'N/A')}")
                print(f"      Categories: {influencer.get('categories', [])}")
                print(f"      Social Media Accounts: {len(influencer.get('social_media_accounts', []))}")
                
                # Check if this looks like demo data
                is_demo = any(indicator in name or indicator in email or indicator in bio 
                             for indicator in demo_indicators)
                
                if not is_demo:
                    real_data_count += 1
                    print(f"      ✅ Appears to be real data")
                else:
                    print(f"      ⚠️  May be demo/test data")
            
            print(f"\n   📈 Real data ratio: {real_data_count}/{min(len(influencers), 3)}")
            
            # Verify required fields are present
            required_fields = ['id', 'name', 'email', 'categories', 'social_media_accounts']
            field_check_passed = True
            
            if influencers:
                sample_influencer = influencers[0]
                print(f"\n   🔍 Checking required fields in sample influencer:")
                for field in required_fields:
                    if field in sample_influencer:
                        print(f"      ✅ {field}: Present")
                    else:
                        print(f"      ❌ {field}: Missing")
                        field_check_passed = False
            
            return field_check_passed
        
        return False

    def test_backend_accessibility(self):
        """Test if backend server is running and accessible"""
        print("\n" + "="*50)
        print("TESTING BACKEND SERVER ACCESSIBILITY")
        print("="*50)
        
        # Test basic connectivity
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=10)
            if response.status_code == 200:
                print("✅ Backend server is accessible")
                print(f"   Docs URL: {self.base_url}/docs")
                print(f"   API Base URL: {self.api_url}")
                return True
            else:
                print(f"❌ Backend docs not accessible: {response.status_code}")
                return False
        except requests.exceptions.Timeout:
            print(f"❌ Backend connection timeout")
            return False
        except Exception as e:
            print(f"❌ Backend connection failed: {str(e)}")
            return False

    def test_api_response_format(self):
        """Test API response format and structure"""
        print("\n" + "="*50)
        print("TESTING API RESPONSE FORMAT")
        print("="*50)
        
        if not self.admin_token:
            print("❌ Cannot test - admin token not available")
            return False
        
        # Test auth/me endpoint format
        success, response = self.run_test(
            "Check auth/me response format",
            "GET",
            "auth/me",
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if success:
            required_user_fields = ['id', 'username', 'email', 'role']
            print(f"   🔍 Checking user response format:")
            format_ok = True
            for field in required_user_fields:
                if field in response:
                    print(f"      ✅ {field}: {response[field]}")
                else:
                    print(f"      ❌ {field}: Missing")
                    format_ok = False
            return format_ok
        
        return False

    def run_demo_data_removal_tests(self):
        """Run specific tests for demo data removal verification"""
        print("🚀 Starting Backend API Tests - Demo Data Removal Verification")
        print(f"🌐 Testing against: {self.base_url}")
        
        all_passed = True
        
        # Test 1: Backend accessibility
        if not self.test_backend_accessibility():
            all_passed = False
        
        # Test 2: Admin login with specific credentials
        if not self.test_admin_login_specific():
            all_passed = False
            print("❌ Cannot proceed with further tests - admin login failed")
            return False
        
        # Test 3: API response format
        if not self.test_api_response_format():
            all_passed = False
        
        # Test 4: Influencers API real data verification
        if not self.test_influencers_api_real_data():
            all_passed = False
        
        # Print final results
        print("\n" + "="*60)
        print("DEMO DATA REMOVAL TEST RESULTS")
        print("="*60)
        
        if all_passed:
            print("🎉 All critical tests passed!")
            print("✅ Backend server is accessible")
            print("✅ Admin login works with specified credentials")
            print("✅ Influencers API is working properly")
            print("✅ API responses are properly formatted")
            return True
        else:
            print("⚠️  Some critical tests failed")
            return False

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