import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Checkbox } from "./components/ui/checkbox";
import { Search, Users, Building, Megaphone, Plus, Filter, Star, MapPin, Calendar, Eye, TrendingUp, Heart, MessageCircle, Share2, Instagram, Youtube, Facebook, UserCheck, Edit, LogOut, Menu, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      await axios.post(`${API}/auth/register`, { username, email, password, role });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Search },
    { name: 'Influencers', href: '/influencers', icon: Users },
    { name: 'Brands', href: '/brands', icon: Building },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ name: 'Users', href: '/users', icon: UserCheck });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Beatfluencer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.username}</div>
                <div className="text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="px-3 py-2">
                <div className="text-base font-medium text-gray-900">{user?.username}</div>
                <div className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Beatfluencer</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  placeholder="Enter your password"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need an account? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard/Landing Page Component
const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [featuredInfluencers, setFeaturedInfluencers] = useState([]);
  const [categories] = useState([
    'Fashion & Style',
    'Beauty & Cosmetics',
    'Fitness & Health',
    'Food & Cooking',
    'Travel',
    'Lifestyle',
    'Technology',
    'Gaming'
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    platform: '',
    gender: '',
    minFollowers: '',
    maxFollowers: '',
    category: '',
    division: ''
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchFeaturedInfluencers();
  }, []);

  const fetchFeaturedInfluencers = async () => {
    try {
      const response = await axios.get(`${API}/influencers?status=published`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeaturedInfluencers(response.data.filter(inf => inf.featured_creators).slice(0, 8));
    } catch (error) {
      console.error('Error fetching featured influencers:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.minFollowers) params.append('min_followers', filters.minFollowers);
      if (filters.maxFollowers) params.append('max_followers', filters.maxFollowers);
      if (filters.category) params.append('category', filters.category);
      if (filters.division) params.append('division', filters.division);

      const response = await axios.get(`${API}/search/influencers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.slice(0, 8));
    } catch (error) {
      console.error('Error searching influencers:', error);
    }
  };

  const InfluencerCard = ({ influencer, isSearchResult = false }) => {
    const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => sum + account.follower_count, 0) || 0;
    const platforms = influencer.social_media_accounts?.map(account => account.platform) || [];
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {influencer.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{influencer.account_type}</p>
              </div>
            </div>
            {influencer.featured_creators && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{totalFollowers.toLocaleString()} followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{influencer.division}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {influencer.categories?.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {influencer.categories?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{influencer.categories.length - 2} more
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-1">
              {platforms.includes('instagram') && <Instagram className="w-4 h-4 text-pink-500" />}
              {platforms.includes('youtube') && <Youtube className="w-4 h-4 text-red-500" />}
              {platforms.includes('facebook') && <Facebook className="w-4 h-4 text-blue-500" />}
            </div>
            <Button size="sm" variant="outline">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border-0 p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find the Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Influencer</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and connect with top influencers across all platforms. Search by natural language or use our advanced filters.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="e.g., 'Instagram influencer with 100K+ followers in Lifestyle under 5000 BDT'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Search className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
            
            {showFilters && (
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Platform</Label>
                    <Select value={filters.platform} onValueChange={(value) => setFilters({...filters, platform: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Gender</Label>
                    <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
              <Button variant="outline">
                View All ({searchResults.length}+)
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} isSearchResult={true} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Creators */}
        {featuredInfluencers.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Creators</h2>
              <Button variant="outline">
                Explore More
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredInfluencers.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-gray-600">Discover influencers in your preferred content categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category} className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category}</h3>
                  <p className="text-sm text-gray-500">Browse creators</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Influencers Page Component
const InfluencersPage = () => {
  const [influencers, setInfluencers] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      const response = await axios.get(`${API}/influencers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInfluencers(response.data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    }
  };

  const canCreateInfluencer = user?.role === 'admin' || user?.role === 'influencer_manager';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Influencers</h1>
            <p className="text-gray-600 mt-1">Manage and discover content creators</p>
          </div>
          {canCreateInfluencer && (
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Influencer
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map((influencer) => (
            <Card key={influencer.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {influencer.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{influencer.name}</CardTitle>
                    <p className="text-sm text-gray-500 capitalize">{influencer.account_type}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{influencer.division}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {influencer.categories?.slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-500">
                      {influencer.social_media_accounts?.length || 0} platforms
                    </span>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Influencer Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Influencer</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-gray-600">Comprehensive influencer creation form coming soon...</p>
              <p className="text-sm text-gray-500 mt-2">This will include all the fields specified in the requirements</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Brands Page Component
const BrandsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Brands</h1>
        <div className="text-center py-16">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Brand management system coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Campaigns Page Component  
const CampaignsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Campaigns</h1>
        <div className="text-center py-16">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Campaign management system coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Users Page Component (Admin only)
const UsersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Users</h1>
        <div className="text-center py-16">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">User management system coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Unauthorized Page Component
const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/influencers" element={
              <ProtectedRoute>
                <InfluencersPage />
              </ProtectedRoute>
            } />
            <Route path="/brands" element={
              <ProtectedRoute>
                <BrandsPage />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;