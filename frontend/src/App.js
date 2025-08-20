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
import { Search, Users, Building, Megaphone, Plus, Filter, Star, MapPin, Calendar, Eye, TrendingUp, Heart, MessageCircle, Share2, Instagram, Youtube, Facebook, UserCheck, Edit, LogOut, Menu, X, ChevronDown, ChevronUp, Sparkles, Zap, Target, BarChart3, Globe, Camera, Video, Mic, Gamepad2, Shirt, Utensils, Dumbbell, Code, Palette, Music, Home, DollarSign, Activity, Layers, PieChart, LineChart, Users2 } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Beatfluencer...</p>
        </div>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Landing', href: '/landing', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Influencers', href: '/influencers', icon: Users },
    { name: 'Brands', href: '/brands', icon: Building },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ name: 'Users', href: '/users', icon: UserCheck });
  }

  return (
    <nav className="bg-white shadow-lg border-b-2 border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/landing" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Beatfluencer
                </span>
                <div className="text-xs text-gray-500 font-medium">Bangladesh Platform</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{user?.username}</div>
                <div className="text-gray-500 capitalize text-xs">{user?.role?.replace('_', ' ')}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
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
          <div className="md:hidden py-4 border-t animate-fade-in">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
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
              <Button variant="ghost" className="w-full justify-start mt-2 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
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
      navigate('/landing');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Beatfluencer</h2>
          <p className="mt-2 text-gray-600">Bangladesh's Premier Influencer Platform</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Badge className="bg-green-100 text-green-800">🇧🇩 Bangladesh</Badge>
            <Badge className="bg-blue-100 text-blue-800">Influencer Marketing</Badge>
          </div>
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-gray-200 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-2 border-gray-200 focus:border-indigo-500"
                  placeholder="Enter your password"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : 'Sign in to Platform'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Demo Accounts:
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div>Admin: admin_new@test.com / admin123</div>
                <div>Manager: cm_new@test.com / cm123</div>
              </div>
            </div>
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

// Influencer Card Component
const InfluencerCard = ({ influencer, showRemuneration = false }) => {
  const { user } = useAuth();
  const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => sum + account.follower_count, 0) || 0;
  const platforms = influencer.social_media_accounts || [];
  const canSeeRemuneration = user?.role !== 'campaign_manager';
  const minRate = influencer.remuneration_services?.length > 0 
    ? Math.min(...influencer.remuneration_services.map(service => service.rate)) 
    : null;
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 bg-white border-0 shadow-md overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {influencer.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
              {influencer.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {influencer.account_type}
              </Badge>
              {influencer.featured_creators && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-gray-900">
              {totalFollowers.toLocaleString()}
            </span>
            <span className="text-gray-600 text-sm">followers</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{influencer.division}</span>
          </div>
        </div>
        
        {/* Platform Icons with Followers */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((account, index) => (
            <div key={index} className="relative group/platform">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1 hover:bg-indigo-100 transition-colors">
                {account.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                {account.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                {account.platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                {account.platform === 'tiktok' && <Video className="w-4 h-4 text-black" />}
                <span className="text-xs font-medium text-gray-700">
                  {account.follower_count > 1000 
                    ? `${(account.follower_count / 1000).toFixed(0)}K` 
                    : account.follower_count}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {influencer.categories?.slice(0, 3).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs border-indigo-200 text-indigo-700">
              {category}
            </Badge>
          ))}
          {influencer.categories?.length > 3 && (
            <Badge variant="outline" className="text-xs border-gray-200">
              +{influencer.categories.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          {canSeeRemuneration && minRate && (
            <div className="text-sm">
              <span className="text-gray-500">From</span>
              <span className="font-bold text-green-600 ml-1">৳{minRate.toLocaleString()}</span>
            </div>
          )}
          <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
            <Eye className="w-3 h-3 mr-1" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Landing Page Component
const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [featuredInfluencers, setFeaturedInfluencers] = useState([]);
  const [categoryInfluencers, setCategoryInfluencers] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { token, user } = useAuth();

  const categories = [
    { name: 'Lifestyle', icon: Sparkles, color: 'from-pink-500 to-rose-500', count: 0 },
    { name: 'Technology', icon: Code, color: 'from-blue-500 to-cyan-500', count: 0 },
    { name: 'Food & Cooking', icon: Utensils, color: 'from-orange-500 to-red-500', count: 0 },
    { name: 'Fashion & Style', icon: Shirt, color: 'from-purple-500 to-indigo-500', count: 0 },
    { name: 'Fitness & Health', icon: Dumbbell, color: 'from-green-500 to-teal-500', count: 0 },
    { name: 'Beauty & Cosmetics', icon: Palette, color: 'from-pink-500 to-purple-500', count: 0 },
    { name: 'Gaming', icon: Gamepad2, color: 'from-indigo-500 to-blue-500', count: 0 },
    { name: 'Music & Entertainment', icon: Music, color: 'from-yellow-500 to-orange-500', count: 0 }
  ];

  const [filters, setFilters] = useState({
    platform: '',
    gender: [],
    minAge: '',
    maxAge: '',
    minFollowers: '',
    maxFollowers: '',
    experience: '',
    division: '',
    categories: [],
    accountType: '',
    verified: '',
    minBudget: '',
    maxBudget: ''
  });

  const bangladeshDivisions = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Sylhet', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  useEffect(() => {
    fetchFeaturedInfluencers();
    fetchCategoryInfluencers();
  }, []);

  const fetchFeaturedInfluencers = async () => {
    try {
      const response = await axios.get(`${API}/influencers?status=published`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const featured = response.data.filter(inf => inf.featured_creators).slice(0, 8);
      setFeaturedInfluencers(featured);
    } catch (error) {
      console.error('Error fetching featured influencers:', error);
    }
  };

  const fetchCategoryInfluencers = async () => {
    const categoryData = {};
    for (const category of categories) {
      try {
        const response = await axios.get(
          `${API}/search/influencers?category=${encodeURIComponent(category.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const featured = response.data.filter(inf => inf.featured_category).slice(0, 9);
        categoryData[category.name] = featured;
      } catch (error) {
        console.error(`Error fetching ${category.name} influencers:`, error);
        categoryData[category.name] = [];
      }
    }
    setCategoryInfluencers(categoryData);
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axios.get(`${API}/search/influencers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.slice(0, 8));
    } catch (error) {
      console.error('Error searching influencers:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Navigation />
      
      {/* Hero Search Section */}
      <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Bangladesh's Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600">Influencers</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover and connect with the most impactful content creators across all platforms in Bangladesh. 
              Search with natural language and find your brand's perfect match.
            </p>
          </div>

          {/* Natural Language Search */}
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="e.g., 'Instagram influencer with over 100,000+ followers working in Lifestyle with budget BDT 5,000'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-14 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:border-green-500 focus:ring-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-16 px-8 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 rounded-xl shadow-lg"
              >
                <Search className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Custom Filters Toggle */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowCustomFilters(!showCustomFilters)}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Custom Filter
                {showCustomFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Layers className="w-4 h-4 mr-2" />
                Advanced Search
                {showAdvancedSearch ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>
            
            {/* Custom Filters Panel */}
            {showCustomFilters && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Platform</Label>
                    <Select value={filters.platform} onValueChange={(value) => setFilters({...filters, platform: value})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Gender</Label>
                    <Select value={filters.gender[0] || ''} onValueChange={(value) => setFilters({...filters, gender: value ? [value] : []})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Experience</Label>
                    <Select value={filters.experience} onValueChange={(value) => setFilters({...filters, experience: value})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5+">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Location</Label>
                    <Select value={filters.division} onValueChange={(value) => setFilters({...filters, division: value})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {bangladeshDivisions.map((division) => (
                          <SelectItem key={division} value={division}>{division}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Advanced Search Panel */}
            {showAdvancedSearch && (
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Follower Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min followers"
                        value={filters.minFollowers}
                        onChange={(e) => setFilters({...filters, minFollowers: e.target.value})}
                        className="h-10"
                      />
                      <Input
                        placeholder="Max followers"
                        value={filters.maxFollowers}
                        onChange={(e) => setFilters({...filters, maxFollowers: e.target.value})}
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Age Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min age"
                        value={filters.minAge}
                        onChange={(e) => setFilters({...filters, minAge: e.target.value})}
                        className="h-10"
                      />
                      <Input
                        placeholder="Max age"
                        value={filters.maxAge}
                        onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Budget Range (BDT)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min budget"
                        value={filters.minBudget}
                        onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                        className="h-10"
                      />
                      <Input
                        placeholder="Max budget"
                        value={filters.maxBudget}
                        onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Account Type</Label>
                    <Select value={filters.accountType} onValueChange={(value) => setFilters({...filters, accountType: value})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Solo</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Verification</Label>
                    <Select value={filters.verified} onValueChange={(value) => setFilters({...filters, verified: value})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Not Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
              <div className="flex items-center space-x-4">
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  {searchResults.length} found
                </Badge>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  View All Results
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} showRemuneration={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category-Based Influencer Showcase */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600">
              Discover featured influencers in specific content categories
            </p>
          </div>
          
          {categories.map((category) => {
            const influencers = categoryInfluencers[category.name] || [];
            if (influencers.length === 0) return null;
            
            return (
              <div key={category.name} className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-gray-600">Featured creators in this category</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    View All {category.name}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {influencers.slice(0, 8).map((influencer) => (
                    <InfluencerCard key={influencer.id} influencer={influencer} />
                  ))}
                  
                  {/* Full List Card */}
                  <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[320px]">
                    <CardContent className="text-center p-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">View All</h3>
                      <p className="text-gray-600 mb-4">
                        See all {category.name} influencers
                      </p>
                      <Button className={`bg-gradient-to-r ${category.color} hover:opacity-90 text-white`}>
                        Full List
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <Star className="inline w-8 h-8 text-yellow-500 mr-2" />
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Creators</span>
            </h2>
            <p className="text-xl text-gray-600">
              Top-performing and most popular influencers on our platform
            </p>
          </div>
          
          {featuredInfluencers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredInfluencers.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} showRemuneration={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured influencers available at the moment</p>
            </div>
          )}
          
          <div className="text-center">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
              Explore More Creators
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.username}! Here's your platform analytics and insights.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Influencers</p>
                    <p className="text-3xl font-bold">1,247</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Active Campaigns</p>
                    <p className="text-3xl font-bold">89</p>
                  </div>
                  <Megaphone className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Brands</p>
                    <p className="text-3xl font-bold">156</p>
                  </div>
                  <Building className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Revenue (BDT)</p>
                    <p className="text-3xl font-bold">৳2.4M</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="w-5 h-5 mr-2 text-indigo-600" />
                  Platform Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chart visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-green-600" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Pie chart visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Other Pages (Placeholder)
const InfluencersPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Influencers Management</h1>
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Comprehensive influencer management system coming soon...</p>
      </div>
    </div>
  </div>
);

const BrandsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Brand Management</h1>
      <div className="text-center py-16">
        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Brand CRM system coming soon...</p>
      </div>
    </div>
  </div>
);

const CampaignsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Campaign Management</h1>
      <div className="text-center py-16">
        <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Campaign management system coming soon...</p>
      </div>
    </div>
  </div>
);

const UsersPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
      <div className="text-center py-16">
        <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">User management system coming soon...</p>
      </div>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
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