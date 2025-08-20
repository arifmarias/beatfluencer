import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
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
import { Search, Users, Building, Megaphone, Plus, Filter, Star, MapPin, Calendar, Eye, TrendingUp, Heart, MessageCircle, Share2, Instagram, Youtube, Facebook, UserCheck, Edit, LogOut, Menu, X, ChevronDown, ChevronUp, Sparkles, Zap, Target, BarChart3, Globe, Camera, Video, Mic, Gamepad2, Shirt, Utensils, Dumbbell, Code, Palette, Music, Home, DollarSign, Activity, Layers, PieChart, LineChart, Users2, ExternalLink, Verified, Award, Crown, Smile } from "lucide-react";

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
              <div className="h-10 w-10 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_brandnest/artifacts/lynsk6m2_image.png" 
                  alt="Beatfluencer Logo"
                  className="h-full w-full object-contain drop-shadow-sm"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
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
          <div className="mx-auto h-32 w-32 mb-8 flex items-center justify-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_brandnest/artifacts/lynsk6m2_image.png" 
              alt="Beatfluencer Logo"
              className="h-full w-full object-contain drop-shadow-lg"
            />
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

// Influencer Profile Modal Component
const InfluencerProfileModal = ({ influencer, onClose }) => {
  if (!influencer) return null;

  const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => 
    sum + (account.follower_count || 0), 0
  ) || 0;

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=400&background=6366f1&color=ffffff`} 
                alt={influencer.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
              />
              <div>
                <h2 className="text-3xl font-bold mb-1">{influencer.name}</h2>
                <p className="text-white/90 text-lg">{influencer.division}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {formatFollowers(totalFollowers)} followers
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-3 rounded-xl"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Bio</span>
                  <p className="text-gray-900">{influencer.bio || 'No bio available'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Account Type</span>
                  <p className="text-gray-900 capitalize">{influencer.account_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Experience</span>
                  <p className="text-gray-900">{influencer.experience_years || 'N/A'} years</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Social Media Accounts</h3>
              <div className="space-y-3">
                {influencer.social_media_accounts?.map((account, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      {account.platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                      {account.platform === 'youtube' && <Youtube className="w-5 h-5 text-red-500" />}
                      {account.platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-500" />}
                      {account.platform === 'tiktok' && <Video className="w-5 h-5 text-black" />}
                      <div>
                        <p className="font-medium capitalize">{account.platform}</p>
                        <p className="text-sm text-gray-500">{account.channel_name}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatFollowers(account.follower_count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          {influencer.categories && influencer.categories.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {influencer.categories.map((category, index) => (
                  <Badge 
                    key={index} 
                    className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Influencer Card Component
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

// Demo Influencer Data
const demoInfluencers = {
  'Lifestyle': [
    {
      id: 'salman-muqtadir',
      name: 'Salman Mohammad Muqtadir', 
      account_type: 'creator',
      bio: 'Lifestyle content creator, entrepreneur, and motivational speaker inspiring millions across Bangladesh',
      division: 'Dhaka',
      gender: 'male',
      date_of_birth: new Date('1994-01-15'),
      categories: ['Lifestyle', 'Business', 'Motivation'],
      verification_status: true,
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'facebook', channel_name: 'SalmanMuqtadir', follower_count: 2800000, verification_status: true, url: 'https://facebook.com/SalmanMuqtadir' },
        { platform: 'youtube', channel_name: 'Salman Muqtadir', follower_count: 1200000, verification_status: true, url: 'https://youtube.com/SalmanMuqtadir' },
        { platform: 'instagram', channel_name: '@salman_muqtadir', follower_count: 890000, verification_status: true, url: 'https://instagram.com/salman_muqtadir' }
      ],
      remuneration_services: [
        { service_name: 'Brand Collaboration', rate: 150000 },
        { service_name: 'Product Review', rate: 80000 }
      ],
      featured_creators: true,
      total_campaigns: 45
    },
    {
      id: 'sunehra-tasnim',
      name: 'Sunehra Tasnim',
      account_type: 'creator', 
      bio: 'Fashion and lifestyle influencer showcasing sustainable fashion and beauty trends',
      division: 'Dhaka',
      gender: 'female',
      date_of_birth: new Date('1996-03-22'),
      categories: ['Fashion & Style', 'Beauty & Cosmetics', 'Lifestyle'],
      verification_status: true,
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b187?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'instagram', channel_name: '@sunehra_tasnim', follower_count: 650000, verification_status: true, url: 'https://instagram.com/sunehra_tasnim' },
        { platform: 'facebook', channel_name: 'Sunehra Tasnim', follower_count: 480000, verification_status: true, url: 'https://facebook.com/SunehraTasnim' },
        { platform: 'tiktok', channel_name: '@sunehra_tasnim', follower_count: 320000, verification_status: false, url: 'https://tiktok.com/@sunehra_tasnim' }
      ],
      remuneration_services: [
        { service_name: 'Fashion Shoot', rate: 75000 },
        { service_name: 'Brand Ambassador', rate: 120000 }
      ],
      featured_creators: true,
      total_campaigns: 32
    },
    {
      id: 'kito-bhai',
      name: 'Kito Bhai',
      account_type: 'creator',
      bio: 'Comedy and entertainment content creator bringing joy and laughter to Bengali audience',
      division: 'Chittagong',
      gender: 'male', 
      date_of_birth: new Date('1992-07-10'),
      categories: ['Entertainment', 'Comedy', 'Lifestyle'],
      verification_status: false,
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'facebook', channel_name: 'Kito Bhai', follower_count: 1200000, verification_status: false, url: 'https://facebook.com/KitoBhai' },
        { platform: 'youtube', channel_name: 'Kito Bhai', follower_count: 580000, verification_status: false, url: 'https://youtube.com/KitoBhai' },
        { platform: 'tiktok', channel_name: '@kito_bhai', follower_count: 450000, verification_status: false, url: 'https://tiktok.com/@kito_bhai' }
      ],
      remuneration_services: [
        { service_name: 'Comedy Video', rate: 45000 },
        { service_name: 'Event Appearance', rate: 60000 }
      ],
      featured_creators: false,
      total_campaigns: 18
    }
  ],
  'Technology': [
    {
      id: 'd-for-disha',
      name: 'D for Disha',
      account_type: 'creator',
      bio: 'Tech reviewer and digital lifestyle content creator focusing on gadgets and innovation',
      division: 'Dhaka',
      gender: 'female',
      date_of_birth: new Date('1995-11-08'),
      categories: ['Technology', 'Gadgets', 'Digital Lifestyle'],
      verification_status: true,
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'youtube', channel_name: 'D for Disha', follower_count: 420000, verification_status: true, url: 'https://youtube.com/DforDisha' },
        { platform: 'instagram', channel_name: '@d_for_disha', follower_count: 280000, verification_status: true, url: 'https://instagram.com/d_for_disha' },
        { platform: 'facebook', channel_name: 'D for Disha', follower_count: 350000, verification_status: true, url: 'https://facebook.com/DforDisha' }
      ],
      remuneration_services: [
        { service_name: 'Tech Review', rate: 85000 },
        { service_name: 'Product Launch', rate: 110000 }
      ],
      featured_creators: true,
      total_campaigns: 28
    },
    {
      id: 'rafsan-chotobhai',
      name: 'Rafsan the ChotoBhai',
      account_type: 'creator',
      bio: 'Tech enthusiast and gaming content creator with expertise in mobile technology',
      division: 'Dhaka',
      gender: 'male',
      date_of_birth: new Date('1997-05-14'),
      categories: ['Technology', 'Gaming', 'Mobile Tech'],
      verification_status: false,
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'youtube', channel_name: 'Rafsan the ChotoBhai', follower_count: 890000, verification_status: true, url: 'https://youtube.com/RafsanChotoBhai' },
        { platform: 'facebook', channel_name: 'Rafsan the ChotoBhai', follower_count: 750000, verification_status: true, url: 'https://facebook.com/RafsanChotoBhai' },
        { platform: 'instagram', channel_name: '@rafsan_chotobhai', follower_count: 320000, verification_status: false, url: 'https://instagram.com/rafsan_chotobhai' }
      ],
      remuneration_services: [
        { service_name: 'Gaming Review', rate: 65000 },
        { service_name: 'Tech Tutorial', rate: 75000 }
      ],
      featured_creators: true,
      total_campaigns: 35
    }
  ],
  'Fashion & Style': [
    {
      id: 'shanti-rehman',
      name: 'Shanti Rehman',
      account_type: 'creator',
      bio: 'Fashion stylist and beauty influencer promoting sustainable and ethical fashion choices',
      division: 'Dhaka',
      gender: 'female',
      date_of_birth: new Date('1993-09-25'),
      categories: ['Fashion & Style', 'Beauty & Cosmetics', 'Sustainability'],
      verification_status: true,
      profile_image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'instagram', channel_name: '@shanti_rehman', follower_count: 540000, verification_status: true, url: 'https://instagram.com/shanti_rehman' },
        { platform: 'youtube', channel_name: 'Shanti Rehman', follower_count: 280000, verification_status: true, url: 'https://youtube.com/ShantiRehman' },
        { platform: 'facebook', channel_name: 'Shanti Rehman', follower_count: 390000, verification_status: true, url: 'https://facebook.com/ShantiRehman' }
      ],
      remuneration_services: [
        { service_name: 'Fashion Collaboration', rate: 95000 },
        { service_name: 'Style Consultation', rate: 55000 }
      ],
      featured_creators: true,
      total_campaigns: 41
    },
    {
      id: 'risha-mirza',
      name: 'Risha Mirza',
      account_type: 'creator',
      bio: 'Fashion designer and lifestyle blogger showcasing contemporary Bengali fashion',
      division: 'Sylhet',
      gender: 'female',
      date_of_birth: new Date('1998-12-03'),
      categories: ['Fashion & Style', 'Design', 'Culture'],
      verification_status: false,
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'instagram', channel_name: '@risha_mirza', follower_count: 340000, verification_status: false, url: 'https://instagram.com/risha_mirza' },
        { platform: 'facebook', channel_name: 'Risha Mirza', follower_count: 220000, verification_status: false, url: 'https://facebook.com/RishaMirza' },
        { platform: 'tiktok', channel_name: '@risha_mirza', follower_count: 180000, verification_status: false, url: 'https://tiktok.com/@risha_mirza' }
      ],
      remuneration_services: [
        { service_name: 'Fashion Design', rate: 70000 },
        { service_name: 'Brand Styling', rate: 85000 }
      ],
      featured_creators: false,
      total_campaigns: 25
    }
  ],
  'Beauty & Cosmetics': [
    {
      id: 'fariha-tasnim',
      name: 'Fariha Tasnim',
      account_type: 'creator',
      bio: 'Beauty guru and makeup artist sharing tutorials and product reviews for Bengali audience',
      division: 'Dhaka',
      gender: 'female',
      date_of_birth: new Date('1996-08-17'),
      categories: ['Beauty & Cosmetics', 'Makeup', 'Skincare'],
      verification_status: true,
      profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'youtube', channel_name: 'Fariha Tasnim', follower_count: 620000, verification_status: true, url: 'https://youtube.com/FarihaTasnim' },
        { platform: 'instagram', channel_name: '@fariha_tasnim', follower_count: 780000, verification_status: true, url: 'https://instagram.com/fariha_tasnim' },
        { platform: 'facebook', channel_name: 'Fariha Tasnim', follower_count: 450000, verification_status: true, url: 'https://facebook.com/FarihaTasnim' }
      ],
      remuneration_services: [
        { service_name: 'Beauty Tutorial', rate: 90000 },
        { service_name: 'Product Review', rate: 65000 }
      ],
      featured_creators: true,
      total_campaigns: 52
    },
    {
      id: 'nusrat-ratu',
      name: 'Nusrat Jahan Ratu',
      account_type: 'creator',
      bio: 'Skincare specialist and beauty content creator promoting natural and organic beauty',
      division: 'Rajshahi',
      gender: 'female',
      date_of_birth: new Date('1994-04-12'),
      categories: ['Beauty & Cosmetics', 'Skincare', 'Natural Beauty'],
      verification_status: false,
      profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'instagram', channel_name: '@nusrat_ratu', follower_count: 420000, verification_status: false, url: 'https://instagram.com/nusrat_ratu' },
        { platform: 'facebook', channel_name: 'Nusrat Jahan Ratu', follower_count: 380000, verification_status: false, url: 'https://facebook.com/NusratRatu' },
        { platform: 'youtube', channel_name: 'Nusrat Ratu', follower_count: 190000, verification_status: false, url: 'https://youtube.com/NusratRatu' }
      ],
      remuneration_services: [
        { service_name: 'Skincare Routine', rate: 50000 },
        { service_name: 'Natural Beauty Tips', rate: 40000 }
      ],
      featured_creators: false,
      total_campaigns: 19
    }
  ],
  'Gaming': [
    {
      id: 'ramisa-anan',
      name: 'Ramisa Anan',
      account_type: 'creator',
      bio: 'Professional gamer and esports content creator representing Bangladesh in international competitions',
      division: 'Dhaka',
      gender: 'female',
      date_of_birth: new Date('1999-01-28'),
      categories: ['Gaming', 'Esports', 'Technology'],
      verification_status: true,
      profile_image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
      social_media_accounts: [
        { platform: 'youtube', channel_name: 'Ramisa Anan Gaming', follower_count: 350000, verification_status: true, url: 'https://youtube.com/RamisaAnan' },
        { platform: 'facebook', channel_name: 'Ramisa Anan', follower_count: 280000, verification_status: true, url: 'https://facebook.com/RamisaAnan' },
        { platform: 'instagram', channel_name: '@ramisa_anan', follower_count: 220000, verification_status: false, url: 'https://instagram.com/ramisa_anan' }
      ],
      remuneration_services: [
        { service_name: 'Gaming Stream', rate: 55000 },
        { service_name: 'Esports Event', rate: 75000 }
      ],
      featured_creators: true,
      total_campaigns: 23
    }
  ]
};
// Enhanced Influencer Card Component for Modal
const DetailedInfluencerCard = ({ influencer, currentCategory }) => {
  const { user } = useAuth();
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => sum + account.follower_count, 0) || 0;
  
  // Get first name only if full name is too long
  const displayName = influencer.name?.length > 15 
    ? influencer.name.split(' ')[0] 
    : influencer.name;

  // Filter out current category from displayed categories
  const filteredCategories = influencer.categories?.filter(
    category => category.toLowerCase() !== currentCategory?.toLowerCase()
  ) || [];

  // Calculate dynamic height based on social media accounts
  const socialMediaCount = influencer.social_media_accounts?.length || 0;
  const baseHeight = 450;
  const expandedBaseHeight = 500;
  const additionalHeightPerSocialMedia = 32; // Height per social media item
  
  const cardHeight = showSocialMedia 
    ? expandedBaseHeight + (Math.max(0, socialMediaCount - 3) * additionalHeightPerSocialMedia)
    : baseHeight;
    
  const contentHeight = showSocialMedia
    ? 300 + (Math.max(0, socialMediaCount - 3) * additionalHeightPerSocialMedia)
    : 250;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-md overflow-hidden w-full max-w-[280px] mx-auto" style={{ height: `${cardHeight}px` }}>
      <div className="relative">
        {/* Clean Profile Image - No Overlays */}
        <div className="overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '200px' }}>
          <img 
            src={influencer.profile_image} 
            alt={influencer.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>
      
      <CardContent className="p-3 flex flex-col" style={{ height: `${contentHeight}px` }}>
        {/* Profile Info - Clean Layout */}
        <div className="text-center mb-2">
          <h3 className="font-bold text-sm text-gray-900 mb-0.5 truncate">{displayName}</h3>
          <div className="text-xs text-gray-600">
            <span>{influencer.division}</span>
          </div>
        </div>
        
        {/* Total Followers - Compact Display */}
        <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-1.5 mb-2">
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Users className="w-3 h-3 text-indigo-600" />
            <span className="text-sm font-bold text-gray-900">
              {totalFollowers > 1000000 
                ? `${(totalFollowers / 1000000).toFixed(1)}M` 
                : totalFollowers > 1000 
                ? `${(totalFollowers / 1000).toFixed(0)}K`
                : totalFollowers.toLocaleString()
              }
            </span>
          </div>
          <span className="text-xs text-gray-600 font-medium">Total Followers</span>
        </div>
        
        {/* Categories - Only show if different from current category */}
        {filteredCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-2">
            {filteredCategories.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50 py-0 px-2">
                {category}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Collapsible Social Media Section */}
        <div className="border-t border-gray-100 pt-1 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSocialMedia(!showSocialMedia)}
            className="w-full text-gray-600 hover:text-indigo-600 transition-colors p-1 h-6 text-xs"
          >
            <Globe className="w-3 h-3 mr-1" />
            <span>Social Media</span>
            <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${showSocialMedia ? 'rotate-180' : ''}`} />
          </Button>
          
          {showSocialMedia && (
            <div className="mt-2 space-y-1.5 animate-fade-in">
              {influencer.social_media_accounts?.map((account, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2 text-xs">
                  <div className="flex items-center space-x-2">
                    {account.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                    {account.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                    {account.platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                    {account.platform === 'tiktok' && <Video className="w-4 h-4 text-black" />}
                    {account.platform === 'twitter' && <MessageCircle className="w-4 h-4 text-blue-400" />}
                    {account.platform === 'linkedin' && <Users className="w-4 h-4 text-blue-600" />}
                    {!['instagram', 'youtube', 'facebook', 'tiktok', 'twitter', 'linkedin'].includes(account.platform) && <Globe className="w-4 h-4 text-gray-500" />}
                    <span className="font-medium capitalize text-xs">{account.platform}</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-xs">
                    {account.follower_count > 1000000 
                      ? `${(account.follower_count / 1000000).toFixed(1)}M` 
                      : account.follower_count > 1000 
                      ? `${(account.follower_count / 1000).toFixed(0)}K`
                      : account.follower_count.toLocaleString()
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Button - Always fully visible at bottom */}
        <div className="mt-auto pt-3 pb-1">
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Category Modal Component
const CategoryModal = ({ category, isOpen, onClose, navigate }) => {
  const influencers = demoInfluencers[category?.name] || [];
  
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${category.color} p-8 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">{category.name} Influencers</h2>
                <p className="text-white/90 text-lg">Featured creators in this category</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-3 rounded-xl"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {/* 9 Influencer Cards */}
            {influencers.slice(0, 9).map((influencer) => (
              <DetailedInfluencerCard key={influencer.id} influencer={influencer} currentCategory={category.name} />
            ))}
            
            {/* 10th Card - Full List - Same Size */}
            <Card className="cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-dashed border-indigo-300 overflow-hidden w-full max-w-[280px] mx-auto flex flex-col" style={{ height: '420px' }}>
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <ExternalLink className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <CardContent className="p-3 flex flex-col justify-between flex-1">
                <div className="text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-1">View All</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3">
                    Explore the complete collection of {category.name} influencers
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-1.5 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 w-full text-xs"
                    onClick={() => navigate(`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`)}
                  >
                    <Layers className="w-3 h-3 mr-1" />
                    Browse Full Category
                  </Button>
                  
                  <div className="text-center">
                    <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1 text-xs font-semibold">
                      {influencers.length}+ creators
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Landing Page Component
const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [featuredInfluencers, setFeaturedInfluencers] = useState([]);
  const [categoryInfluencers, setCategoryInfluencers] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { name: 'Fashion & Style', icon: Shirt, color: 'from-slate-100 to-slate-200', iconColor: 'text-slate-600', count: 0 },
    { name: 'Beauty & Cosmetics', icon: Palette, color: 'from-rose-50 to-pink-100', iconColor: 'text-rose-600', count: 0 },
    { name: 'Fitness & Health', icon: Dumbbell, color: 'from-emerald-50 to-green-100', iconColor: 'text-emerald-600', count: 0 },
    { name: 'Food & Cooking', icon: Utensils, color: 'from-orange-50 to-amber-100', iconColor: 'text-orange-600', count: 0 },
    { name: 'Travel', icon: MapPin, color: 'from-sky-50 to-blue-100', iconColor: 'text-sky-600', count: 0 },
    { name: 'Lifestyle', icon: Sparkles, color: 'from-purple-50 to-violet-100', iconColor: 'text-purple-600', count: 0 },
    { name: 'Technology', icon: Code, color: 'from-indigo-50 to-blue-100', iconColor: 'text-indigo-600', count: 0 },
    { name: 'Gaming', icon: Gamepad2, color: 'from-cyan-50 to-teal-100', iconColor: 'text-cyan-600', count: 0 },
    { name: 'Parenting & Family', icon: Users2, color: 'from-green-50 to-emerald-100', iconColor: 'text-green-600', count: 0 },
    { name: 'Business & Finance', icon: Building, color: 'from-gray-50 to-slate-100', iconColor: 'text-gray-600', count: 0 },
    { name: 'Education', icon: Users, color: 'from-blue-50 to-indigo-100', iconColor: 'text-blue-600', count: 0 },
    { name: 'Entertainment', icon: Star, color: 'from-yellow-50 to-amber-100', iconColor: 'text-yellow-600', count: 0 },
    { name: 'Home & Garden', icon: Home, color: 'from-lime-50 to-green-100', iconColor: 'text-lime-600', count: 0 },
    { name: 'Pets & Animals', icon: Heart, color: 'from-pink-50 to-rose-100', iconColor: 'text-pink-600', count: 0 },
    { name: 'Sports', icon: Target, color: 'from-red-50 to-orange-100', iconColor: 'text-red-600', count: 0 },
    { name: 'Art & Creativity', icon: Palette, color: 'from-violet-50 to-purple-100', iconColor: 'text-violet-600', count: 0 },
    { name: 'Automotive', icon: Zap, color: 'from-stone-50 to-gray-100', iconColor: 'text-stone-600', count: 0 },
    { name: 'Religious/Spiritual Content', icon: Star, color: 'from-amber-50 to-yellow-100', iconColor: 'text-amber-600', count: 0 },
    { name: 'Social Causes & NGO', icon: Globe, color: 'from-teal-50 to-emerald-100', iconColor: 'text-teal-600', count: 0 },
    { name: 'Local Culture & Traditions', icon: Users, color: 'from-indigo-50 to-violet-100', iconColor: 'text-indigo-600', count: 0 },
    { name: 'Language Learning', icon: MessageCircle, color: 'from-sky-50 to-cyan-100', iconColor: 'text-sky-600', count: 0 },
    { name: 'DIY & Crafts', icon: Edit, color: 'from-orange-50 to-red-100', iconColor: 'text-orange-600', count: 0 },
    { name: 'Photography', icon: Camera, color: 'from-slate-50 to-zinc-100', iconColor: 'text-slate-600', count: 0 },
    { name: 'Music & Dance', icon: Music, color: 'from-fuchsia-50 to-pink-100', iconColor: 'text-fuchsia-600', count: 0 },
    { name: 'Comedy & Humor', icon: Smile, color: 'from-yellow-50 to-orange-100', iconColor: 'text-yellow-600', count: 0 },
    { name: 'Others', icon: Layers, color: 'from-neutral-50 to-gray-100', iconColor: 'text-neutral-600', count: 0 }
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

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
    
    // Load demo data for the category
    if (demoInfluencers[category.name]) {
      setCategoryInfluencers(prev => ({
        ...prev,
        [category.name]: demoInfluencers[category.name]
      }));
    }
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
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
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
              <span className="text-sm font-medium text-gray-700">🇧🇩 Bangladesh's Premier Influencer Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Amazing{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                  Creators
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 rounded-full opacity-50"></div>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with Bangladesh's most talented content creators across all platforms. 
              Use intelligent search to find the perfect match for your brand.
            </p>
          </div>

          {/* Enhanced Search Interface */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <Input
                      placeholder="e.g., 'Instagram influencer with over 100,000+ followers working in Lifestyle with budget BDT 5,000'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-16 pl-16 pr-6 text-lg border-0 bg-transparent focus:ring-0 placeholder:text-gray-400 font-medium"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="h-16 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Advanced Search Toggle */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:text-blue-600 px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 font-medium"
              >
                <Filter className="w-5 h-5 mr-3" />
                Advanced Search & Filters
                <ChevronDown className={`w-5 h-5 ml-3 transition-transform duration-300 ${showAdvancedSearch ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {/* Advanced Search Panel */}
            {showAdvancedSearch && (
              <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden animate-fade-in">
                <div className="p-10 space-y-10">
                  {/* Platform & Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                      <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        Platform
                      </Label>
                      <Select value={filters.platform} onValueChange={(value) => setFilters({...filters, platform: value})}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="facebook">
                            <div className="flex items-center">
                              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                              Facebook
                            </div>
                          </SelectItem>
                          <SelectItem value="youtube">
                            <div className="flex items-center">
                              <Youtube className="w-4 h-4 mr-2 text-red-600" />
                              YouTube
                            </div>
                          </SelectItem>
                          <SelectItem value="instagram">
                            <div className="flex items-center">
                              <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                              Instagram
                            </div>
                          </SelectItem>
                          <SelectItem value="tiktok">
                            <div className="flex items-center">
                              <Video className="w-4 h-4 mr-2 text-black" />
                              TikTok
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                          <Users2 className="w-4 h-4 text-white" />
                        </div>
                        Gender
                      </Label>
                      <Select value={filters.gender[0] || ''} onValueChange={(value) => setFilters({...filters, gender: value ? [value] : []})}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
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
                      <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        Experience
                      </Label>
                      <Select value={filters.experience} onValueChange={(value) => setFilters({...filters, experience: value})}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
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
                      <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        Location
                      </Label>
                      <Select value={filters.division} onValueChange={(value) => setFilters({...filters, division: value})}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
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

                  {/* Advanced Filters */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      Advanced Filters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div>
                        <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          Follower Range
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Min followers"
                            value={filters.minFollowers}
                            onChange={(e) => setFilters({...filters, minFollowers: e.target.value})}
                            className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors"
                          />
                          <Input
                            placeholder="Max followers"
                            value={filters.maxFollowers}
                            onChange={(e) => setFilters({...filters, maxFollowers: e.target.value})}
                            className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                          Age Range
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Min age"
                            value={filters.minAge}
                            onChange={(e) => setFilters({...filters, minAge: e.target.value})}
                            className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors"
                          />
                          <Input
                            placeholder="Max age"
                            value={filters.maxAge}
                            onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
                            className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                          Budget Range (BDT)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Min budget"
                            value={filters.minBudget}
                            onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                            className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors"
                          />
                          <Input
                            placeholder="Max budget"
                            value={filters.maxBudget}
                            onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                            className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                          <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                          Account Type
                        </Label>
                        <Select value={filters.accountType} onValueChange={(value) => setFilters({...filters, accountType: value})}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Solo Creator</SelectItem>
                            <SelectItem value="business">Business Account</SelectItem>
                            <SelectItem value="creator">Professional Creator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-bold text-gray-800 mb-4 block flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-600" />
                          Verification
                        </Label>
                        <Select value={filters.verified} onValueChange={(value) => setFilters({...filters, verified: value})}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                            <SelectValue placeholder="Verification status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">✓ Verified</SelectItem>
                            <SelectItem value="false">⚬ Not Verified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <div className="flex justify-center pt-8 border-t border-gray-200">
                    <Button 
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-16 py-4 rounded-2xl text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Search className="w-5 h-5 mr-3" />
                      Apply Filters & Search
                    </Button>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600">
              Discover featured influencers in specific content categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {categories.map((category) => (
              <Card 
                key={category.name}
                className="cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border border-gray-100 bg-white/80 backdrop-blur-sm overflow-hidden group"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="relative p-4 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 transform transition-all duration-300 group-hover:scale-110 shadow-sm border border-white`}>
                    <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">{category.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium border-0">
                      {demoInfluencers[category.name]?.length || 0} creators
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Modal */}
          <CategoryModal 
            category={selectedCategory}
            isOpen={showCategoryModal}
            onClose={closeCategoryModal}
            navigate={navigate}
          />
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

// Enhanced Influencer Card Component

// Add Influencer Form Component
const AddInfluencerForm = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    account_type: 'creator',
    name: '',
    email: '',
    phone: '',
    address: '',
    division: '',
    gender: 'male',
    date_of_birth: '',
    bio: '',
    profile_image: '',
    
    // Categories
    categories: [],
    
    // Remuneration
    remuneration_services: [],
    
    // Experience
    experience_years: '0-1',
    total_campaigns: 0,
    affiliated_brands: [],
    dedicated_brands: [],
    successful_campaigns: [],
    industries_worked: [],
    
    // Payment Information
    beneficiary_name: '',
    account_number: '',
    tin_number: '',
    bank_name: '',
    
    // Featured Options
    featured_category: false,
    featured_creators: false,
    
    // Social Media
    active_platforms: [],
    social_media_accounts: []
  });

  const [urlErrors, setUrlErrors] = useState({});

  const divisions = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
  ];

  const categoryOptions = [
    'Fashion & Style', 'Beauty & Cosmetics', 'Fitness & Health', 'Food & Cooking', 
    'Travel', 'Lifestyle', 'Technology', 'Gaming', 'Parenting & Family', 
    'Business & Finance', 'Education', 'Entertainment', 'Home & Garden', 
    'Pets & Animals', 'Sports', 'Art & Creativity', 'Automotive', 
    'Religious/Spiritual Content', 'Social Causes & NGO', 'Local Culture & Traditions', 
    'Language Learning', 'DIY & Crafts', 'Photography', 'Music & Dance', 
    'Comedy & Humor', 'Others'
  ];

  const industryOptions = [
    'Fashion & Apparel', 'Beauty & Personal Care', 'Technology & Electronics', 
    'Food & Beverage', 'Travel & Tourism', 'Health & Fitness', 'Financial Services', 
    'Real Estate', 'Education & E-learning', 'Automotive', 'Home & Living', 
    'Baby & Kids Products', 'Sports & Recreation', 'Entertainment & Media', 'Others'
  ];

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', baseUrl: 'https://facebook.com/' },
    { id: 'instagram', name: 'Instagram', baseUrl: 'https://instagram.com/' },
    { id: 'youtube', name: 'Youtube', baseUrl: 'https://youtube.com/' },
    { id: 'tiktok', name: 'TikTok', baseUrl: 'https://tiktok.com/' },
    { id: 'linkedin', name: 'LinkedIn', baseUrl: 'https://linkedin.com/' },
    { id: 'snapchat', name: 'Snapchat', baseUrl: 'https://snapchat.com/' }
  ];

  const handlePlatformSelection = (platformId, checked) => {
    setFormData(prev => {
      const newActivePlatforms = checked 
        ? [...prev.active_platforms, platformId]
        : prev.active_platforms.filter(id => id !== platformId);

      // Create or remove social media account for this platform
      let newSocialMediaAccounts = [...prev.social_media_accounts];
      
      if (checked) {
        // Add new account for this platform
        const platform = socialPlatforms.find(p => p.id === platformId);
        newSocialMediaAccounts.push({
          platform: platformId,
          platform_name: platform.name,
          channel_name: '',
          url: '',
          follower_count: 0,
          verification_status: false,
          cpv: 0,
          created_year: new Date().getFullYear(),
          created_month: new Date().getMonth() + 1
        });
      } else {
        // Remove account for this platform
        newSocialMediaAccounts = newSocialMediaAccounts.filter(
          account => account.platform !== platformId
        );
      }

      return {
        ...prev,
        active_platforms: newActivePlatforms,
        social_media_accounts: newSocialMediaAccounts
      };
    });
  };

  const updateSocialMediaByPlatform = (platformId, field, value) => {
    setFormData(prev => ({
      ...prev,
      social_media_accounts: prev.social_media_accounts.map(account => 
        account.platform === platformId ? { ...account, [field]: value } : account
      )
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload-image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      handleInputChange('profile_image', response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const checkUrlExists = async (url, platformId) => {
    if (!url.trim()) {
      setUrlErrors(prev => ({ ...prev, [platformId]: '' }));
      return;
    }

    try {
      const response = await axios.get(`${API}/influencers/check-url`, {
        params: { url: url.trim() },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.exists) {
        setUrlErrors(prev => ({ 
          ...prev, 
          [platformId]: 'This URL is already registered by another influencer' 
        }));
      } else {
        setUrlErrors(prev => ({ ...prev, [platformId]: '' }));
      }
    } catch (error) {
      // If endpoint doesn't exist yet, just clear the error
      setUrlErrors(prev => ({ ...prev, [platformId]: '' }));
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const addRemuneration = () => {
    setFormData(prev => ({
      ...prev,
      remuneration_services: [...prev.remuneration_services, { service_name: '', rate: 0 }]
    }));
  };

  const updateRemuneration = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      remuneration_services: prev.remuneration_services.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeRemuneration = (index) => {
    setFormData(prev => ({
      ...prev,
      remuneration_services: prev.remuneration_services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Name is required');
        setLoading(false);
        return;
      }
      
      if (!formData.email.trim()) {
        alert('Email is required');
        setLoading(false);
        return;
      }
      
      if (!formData.date_of_birth) {
        alert('Date of birth is required');
        setLoading(false);
        return;
      }

      // Validate social media accounts
      for (const account of formData.social_media_accounts) {
        if (!account.channel_name.trim()) {
          alert(`Channel name is required for ${account.platform_name}`);
          setLoading(false);
          return;
        }
        if (!account.url.trim()) {
          alert(`Platform URL is required for ${account.platform_name}`);
          setLoading(false);
          return;
        }
      }

      // Convert and clean data for backend
      const submitData = {
        // Personal Information
        account_type: formData.account_type,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        division: formData.division,
        gender: formData.gender,
        date_of_birth: new Date(formData.date_of_birth).toISOString(),
        bio: formData.bio?.trim() || null,
        profile_image: formData.profile_image || null,
        
        // Categories
        categories: formData.categories,
        
        // Remuneration
        remuneration_services: formData.remuneration_services.filter(service => 
          service.service_name.trim() && service.rate > 0
        ),
        
        // Experience
        experience_years: formData.experience_years,
        total_campaigns: parseInt(formData.total_campaigns) || 0,
        affiliated_brands: Array.isArray(formData.affiliated_brands) 
          ? formData.affiliated_brands.filter(brand => brand.trim())
          : formData.affiliated_brands ? formData.affiliated_brands.split(',').map(b => b.trim()).filter(b => b) : [],
        dedicated_brands: formData.dedicated_brands || [],
        successful_campaigns: formData.successful_campaigns || [],
        industries_worked: formData.industries_worked,
        
        // Payment Information
        beneficiary_name: formData.beneficiary_name?.trim() || null,
        account_number: formData.account_number?.trim() || null,
        tin_number: formData.tin_number?.trim() || null,
        bank_name: formData.bank_name?.trim() || null,
        
        // Featured Options
        featured_category: Boolean(formData.featured_category),
        featured_creators: Boolean(formData.featured_creators),
        
        // Social Media - ensure proper structure
        social_media_accounts: formData.social_media_accounts.map(account => ({
          platform: account.platform,
          channel_name: account.channel_name.trim(),
          url: account.url.trim(),
          follower_count: parseInt(account.follower_count) || 0,
          verification_status: Boolean(account.verification_status),
          cpv: parseFloat(account.cpv) || 0,
          created_year: parseInt(account.created_year) || new Date().getFullYear(),
          created_month: parseInt(account.created_month) || (new Date().getMonth() + 1)
        }))
      };

      console.log('Submitting data:', submitData); // For debugging

      await axios.post(`${API}/influencers`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating influencer:', error);
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response?.status === 422) {
        alert('Validation error: Please check all required fields are filled correctly.');
      } else {
        alert('Error creating influencer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: Users },
    { id: 2, title: 'Categories & Experience', icon: Star },
    { id: 3, title: 'Payment & Features', icon: DollarSign },
    { id: 4, title: 'Social Media', icon: Globe }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Add New Influencer</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id ? 'bg-white text-indigo-500' : 'bg-white/20 text-white'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step.id ? 'text-white font-medium' : 'text-white/70'}`}>
                  {step.title}
                </span>
                {step.id < steps.length && <ChevronDown className="w-4 h-4 ml-4 text-white/50 rotate-[-90deg]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative">
                  {formData.profile_image ? (
                    <div className="relative">
                      <img 
                        src={formData.profile_image} 
                        alt="Profile Preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() => handleInputChange('profile_image', '')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <Label htmlFor="profile_image" className="cursor-pointer">
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 transition-colors">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          <span className="text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formData.profile_image ? 'Change Photo' : 'Upload Photo'}
                          </span>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG, GIF up to 5MB. Recommended: 400x400px
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select value={formData.account_type} onValueChange={(value) => handleInputChange('account_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="division">Division</Label>
                  <Select value={formData.division} onValueChange={(value) => handleInputChange('division', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map(division => (
                        <SelectItem key={division} value={division}>{division}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input 
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <Label>Gender</Label>
                <div className="flex space-x-4 mt-2">
                  {['male', 'female', 'others'].map(gender => (
                    <label key={gender} className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="text-indigo-500"
                      />
                      <span className="capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Enter bio/description"
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* Step 2: Categories & Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories & Experience</h3>
              
              {/* Categories */}
              <div>
                <Label>Influencer Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {categoryOptions.map(category => (
                    <label key={category} className="flex items-center space-x-2 text-sm">
                      <Checkbox 
                        checked={formData.categories.includes(category)}
                        onCheckedChange={(checked) => handleArrayChange('categories', category, checked)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_years">Years as Content Creator</Label>
                  <Select value={formData.experience_years} onValueChange={(value) => handleInputChange('experience_years', value)}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="total_campaigns">Total Campaigns Completed</Label>
                  <Input 
                    id="total_campaigns"
                    type="number"
                    value={formData.total_campaigns}
                    onChange={(e) => handleInputChange('total_campaigns', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Affiliated Brands */}
              <div>
                <Label htmlFor="affiliated_brands">Affiliated Brands (comma-separated)</Label>
                <Input 
                  id="affiliated_brands"
                  value={formData.affiliated_brands.join(', ')}
                  onChange={(e) => handleInputChange('affiliated_brands', e.target.value.split(',').map(b => b.trim()))}
                  placeholder="Brand 1, Brand 2, Brand 3..."
                />
              </div>

              {/* Industries */}
              <div>
                <Label>Industries Worked With</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {industryOptions.map(industry => (
                    <label key={industry} className="flex items-center space-x-2 text-sm">
                      <Checkbox 
                        checked={formData.industries_worked.includes(industry)}
                        onCheckedChange={(checked) => handleArrayChange('industries_worked', industry, checked)}
                      />
                      <span>{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remuneration */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Remuneration Services</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={addRemuneration}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Service
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.remuneration_services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input 
                        placeholder="Service name"
                        value={service.service_name}
                        onChange={(e) => updateRemuneration(index, 'service_name', e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        type="number"
                        placeholder="Rate (BDT)"
                        value={service.rate}
                        onChange={(e) => updateRemuneration(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeRemuneration(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Features */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information & Features</h3>
              
              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="beneficiary_name">Beneficiary Name</Label>
                  <Input 
                    id="beneficiary_name"
                    value={formData.beneficiary_name}
                    onChange={(e) => handleInputChange('beneficiary_name', e.target.value)}
                    placeholder="Account holder name"
                  />
                </div>

                <div>
                  <Label htmlFor="account_number">Account/Card Number</Label>
                  <Input 
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                    placeholder="Account or card number"
                  />
                </div>

                <div>
                  <Label htmlFor="tin_number">TIN Number</Label>
                  <Input 
                    id="tin_number"
                    value={formData.tin_number}
                    onChange={(e) => handleInputChange('tin_number', e.target.value)}
                    placeholder="Tax identification number"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_name">Bank Name & Branch</Label>
                  <Input 
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    placeholder="Bank name with branch"
                  />
                </div>
              </div>

              {/* Featured Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Featured in Landing Page</h4>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={formData.featured_category}
                      onCheckedChange={(checked) => handleInputChange('featured_category', checked)}
                    />
                    <span>Featured in Category</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={formData.featured_creators}
                      onCheckedChange={(checked) => handleInputChange('featured_creators', checked)}
                    />
                    <span>Featured in Creators Section</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Social Media */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Media Information</h3>
              
              {/* Platform Selection */}
              <div>
                <Label className="text-base font-medium">Platform Active On</Label>
                <p className="text-sm text-gray-600 mb-3">Select all platforms where this influencer is active</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {socialPlatforms.map(platform => (
                    <label key={platform.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox 
                        checked={formData.active_platforms.includes(platform.id)}
                        onCheckedChange={(checked) => handlePlatformSelection(platform.id, checked)}
                      />
                      <div className="flex items-center space-x-2">
                        {platform.id === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                        {platform.id === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                        {platform.id === 'youtube' && <Youtube className="w-5 h-5 text-red-500" />}
                        {platform.id === 'tiktok' && <Video className="w-5 h-5 text-black" />}
                        {platform.id === 'linkedin' && <Users className="w-5 h-5 text-blue-700" />}
                        {platform.id === 'snapchat' && <Camera className="w-5 h-5 text-yellow-500" />}
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Platform Details */}
              {formData.active_platforms.length > 0 && (
                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Platform Details</h4>
                    
                    {formData.active_platforms.map(platformId => {
                      const platform = socialPlatforms.find(p => p.id === platformId);
                      const account = formData.social_media_accounts.find(acc => acc.platform === platformId);
                      
                      return (
                        <div key={platformId} className="bg-gray-50 rounded-lg p-6 space-y-4 mb-6">
                          <div className="flex items-center space-x-2 mb-4">
                            {platformId === 'facebook' && <Facebook className="w-6 h-6 text-blue-600" />}
                            {platformId === 'instagram' && <Instagram className="w-6 h-6 text-pink-500" />}
                            {platformId === 'youtube' && <Youtube className="w-6 h-6 text-red-500" />}
                            {platformId === 'tiktok' && <Video className="w-6 h-6 text-black" />}
                            {platformId === 'linkedin' && <Users className="w-6 h-6 text-blue-700" />}
                            {platformId === 'snapchat' && <Camera className="w-6 h-6 text-yellow-500" />}
                            <h5 className="text-lg font-semibold text-gray-900">{platform.name}</h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Channel Name - Mandatory */}
                            <div>
                              <Label className="text-sm font-medium">
                                Channel Name <span className="text-red-500">*</span>
                              </Label>
                              <Input 
                                value={account?.channel_name || ''}
                                onChange={(e) => updateSocialMediaByPlatform(platformId, 'channel_name', e.target.value)}
                                placeholder={`@username or ${platform.name} page name`}
                                className="mt-1"
                                required
                              />
                            </div>

                            {/* Platform URL - Mandatory with validation */}
                            <div>
                              <Label className="text-sm font-medium">
                                Platform URL <span className="text-red-500">*</span>
                              </Label>
                              <Input 
                                value={account?.url || ''}
                                onChange={(e) => {
                                  updateSocialMediaByPlatform(platformId, 'url', e.target.value);
                                  checkUrlExists(e.target.value, platformId);
                                }}
                                placeholder={`${platform.baseUrl}username`}
                                className={`mt-1 ${urlErrors[platformId] ? 'border-red-500' : ''}`}
                                required
                              />
                              {urlErrors[platformId] && (
                                <p className="text-red-500 text-xs mt-1">{urlErrors[platformId]}</p>
                              )}
                            </div>

                            {/* Channel Created Year */}
                            <div>
                              <Label className="text-sm font-medium">Channel Created Year</Label>
                              <Select 
                                value={account?.created_year?.toString() || new Date().getFullYear().toString()} 
                                onValueChange={(value) => updateSocialMediaByPlatform(platformId, 'created_year', parseInt(value))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: new Date().getFullYear() - 2003}, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Channel Created Month */}
                            <div>
                              <Label className="text-sm font-medium">Channel Created Month</Label>
                              <Select 
                                value={account?.created_month?.toString() || (new Date().getMonth() + 1).toString()} 
                                onValueChange={(value) => updateSocialMediaByPlatform(platformId, 'created_month', parseInt(value))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: 12}, (_, i) => (
                                    <SelectItem key={i+1} value={(i+1).toString()}>
                                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Follower Count */}
                            <div>
                              <Label className="text-sm font-medium">Follower Count</Label>
                              <Input 
                                type="number"
                                value={account?.follower_count || 0}
                                onChange={(e) => updateSocialMediaByPlatform(platformId, 'follower_count', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="mt-1"
                                min="0"
                              />
                            </div>

                            {/* CPV */}
                            <div>
                              <Label className="text-sm font-medium">CPV (Cost Per View)</Label>
                              <Input 
                                type="number"
                                step="0.01"
                                value={account?.cpv || 0}
                                onChange={(e) => updateSocialMediaByPlatform(platformId, 'cpv', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="mt-1"
                                min="0"
                              />
                            </div>
                          </div>

                          {/* Verification Status */}
                          <div className="pt-2">
                            <label className="flex items-center space-x-3">
                              <Checkbox 
                                checked={account?.verification_status || false}
                                onCheckedChange={(checked) => updateSocialMediaByPlatform(platformId, 'verification_status', checked)}
                              />
                              <div className="flex items-center space-x-2">
                                <Verified className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium">Verified Account</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.active_platforms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Select platforms above to configure social media accounts</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-green-500 hover:bg-green-600"
              >
                {loading ? 'Creating...' : 'Create Influencer'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Influencers Management Page
const InfluencersPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [influencers, setInfluencers] = useState([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { token } = useAuth();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    platforms: [],
    gender: '',
    experienceRange: '',
    categories: [],
    location: '',
    verificationStatus: '',
    featuredStatus: '',
    followerCountMin: '',
    followerCountMax: '',
    remunerationMin: '',
    remunerationMax: ''
  });

  const filterOptions = {
    platforms: [
      { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
      { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
      { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
      { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-black' },
      { id: 'linkedin', name: 'LinkedIn', icon: Users, color: 'text-blue-700' },
      { id: 'snapchat', name: 'Snapchat', icon: Camera, color: 'text-yellow-500' }
    ],
    experienceRanges: [
      { value: '0-1', label: '0-1 years' },
      { value: '1-3', label: '1-3 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '5+', label: '5+ years' }
    ],
    categories: [
      'Fashion & Style', 'Beauty & Cosmetics', 'Fitness & Health', 'Food & Cooking', 
      'Travel', 'Lifestyle', 'Technology', 'Gaming', 'Parenting & Family', 
      'Business & Finance', 'Education', 'Entertainment', 'Home & Garden', 
      'Pets & Animals', 'Sports', 'Art & Creativity', 'Automotive', 
      'Religious/Spiritual Content', 'Social Causes & NGO', 'Local Culture & Traditions', 
      'Language Learning', 'DIY & Crafts', 'Photography', 'Music & Dance', 
      'Comedy & Humor', 'Others'
    ],
    divisions: [
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
    ]
  };

  const fetchInfluencers = async () => {
    try {
      const response = await axios.get(`${API}/influencers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInfluencers(response.data);
      setFilteredInfluencers(response.data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    }
  };

  // Apply search and filters
  const applyFilters = () => {
    let filtered = [...influencers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(influencer => 
        influencer.name.toLowerCase().includes(query) ||
        influencer.social_media_accounts?.some(account => 
          account.channel_name?.toLowerCase().includes(query)
        ) ||
        influencer.affiliated_brands?.some(brand => 
          brand.toLowerCase().includes(query)
        )
      );
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(influencer =>
        influencer.social_media_accounts?.some(account =>
          filters.platforms.includes(account.platform)
        )
      );
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(influencer => influencer.gender === filters.gender);
    }

    // Experience filter
    if (filters.experienceRange) {
      filtered = filtered.filter(influencer => influencer.experience_years === filters.experienceRange);
    }

    // Categories filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(influencer =>
        influencer.categories?.some(category =>
          filters.categories.includes(category)
        )
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(influencer => influencer.division === filters.location);
    }

    // Verification status filter
    if (filters.verificationStatus) {
      const isVerified = filters.verificationStatus === 'verified';
      filtered = filtered.filter(influencer =>
        influencer.social_media_accounts?.some(account => account.verification_status === isVerified)
      );
    }

    // Featured status filter
    if (filters.featuredStatus) {
      const isFeatured = filters.featuredStatus === 'featured';
      filtered = filtered.filter(influencer => 
        influencer.featured_category === isFeatured || influencer.featured_creators === isFeatured
      );
    }

    // Follower count range filter
    if (filters.followerCountMin || filters.followerCountMax) {
      filtered = filtered.filter(influencer => {
        const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => 
          sum + (account.follower_count || 0), 0
        ) || 0;
        
        const min = parseInt(filters.followerCountMin) || 0;
        const max = parseInt(filters.followerCountMax) || Infinity;
        
        return totalFollowers >= min && totalFollowers <= max;
      });
    }

    // Remuneration range filter
    if (filters.remunerationMin || filters.remunerationMax) {
      filtered = filtered.filter(influencer => {
        const avgRemuneration = influencer.remuneration_services?.reduce((sum, service) => 
          sum + (service.rate || 0), 0
        ) / (influencer.remuneration_services?.length || 1) || 0;
        
        const min = parseInt(filters.remunerationMin) || 0;
        const max = parseInt(filters.remunerationMax) || Infinity;
        
        return avgRemuneration >= min && avgRemuneration <= max;
      });
    }

    setFilteredInfluencers(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value, isMultiSelect = false) => {
    setFilters(prev => {
      if (isMultiSelect) {
        const currentValues = prev[filterType] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      platforms: [],
      gender: '',
      experienceRange: '',
      categories: [],
      location: '',
      verificationStatus: '',
      featuredStatus: '',
      followerCountMin: '',
      followerCountMax: '',
      remunerationMin: '',
      remunerationMax: ''
    });
    setSearchQuery('');
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.gender) count++;
    if (filters.experienceRange) count++;
    if (filters.categories.length > 0) count++;
    if (filters.location) count++;
    if (filters.verificationStatus) count++;
    if (filters.featuredStatus) count++;
    if (filters.followerCountMin || filters.followerCountMax) count++;
    if (filters.remunerationMin || filters.remunerationMax) count++;
    return count;
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, influencers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Influencers Management</h1>
            <p className="text-gray-600 mt-1">
              {filteredInfluencers.length} of {influencers.length} influencers
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Influencer
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, channel, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-12 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge className="ml-2 bg-indigo-500 text-white">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="h-12 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Platforms Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Platforms</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.platforms.map(platform => (
                      <label key={platform.id} className="flex items-center space-x-2 text-sm">
                        <Checkbox
                          checked={filters.platforms.includes(platform.id)}
                          onCheckedChange={(checked) => handleFilterChange('platforms', platform.id, true)}
                        />
                        <platform.icon className={`w-4 h-4 ${platform.color}`} />
                        <span>{platform.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Gender</Label>
                  <Select value={filters.gender || "all"} onValueChange={(value) => handleFilterChange('gender', value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Range Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Experience</Label>
                  <Select value={filters.experienceRange || "all"} onValueChange={(value) => handleFilterChange('experienceRange', value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experience</SelectItem>
                      {filterOptions.experienceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Location</Label>
                  <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {filterOptions.divisions.map(division => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Categories</Label>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto bg-white">
                    {filterOptions.categories.map(category => (
                      <label key={category} className="flex items-center space-x-2 text-sm py-1">
                        <Checkbox
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => handleFilterChange('categories', category, true)}
                        />
                        <span className="text-xs">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification Status Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Verification</Label>
                  <Select value={filters.verificationStatus || "all"} onValueChange={(value) => handleFilterChange('verificationStatus', value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Status Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Featured Status</Label>
                  <Select value={filters.featuredStatus || "all"} onValueChange={(value) => handleFilterChange('featuredStatus', value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select featured" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="non-featured">Non-Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Follower Count Range */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Follower Count</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.followerCountMin}
                      onChange={(e) => handleFilterChange('followerCountMin', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.followerCountMax}
                      onChange={(e) => handleFilterChange('followerCountMax', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Remuneration Range */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Remuneration (BDT)</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.remunerationMin}
                      onChange={(e) => handleFilterChange('remunerationMin', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.remunerationMax}
                      onChange={(e) => handleFilterChange('remunerationMax', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Search: "{searchQuery}"
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}
                  {filters.platforms.map(platform => (
                    <Badge key={platform} variant="secondary" className="bg-blue-100 text-blue-800">
                      {filterOptions.platforms.find(p => p.id === platform)?.name}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => handleFilterChange('platforms', platform, true)}
                      />
                    </Badge>
                  ))}
                  {filters.gender && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">
                      {filters.gender}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => handleFilterChange('gender', '')}
                      />
                    </Badge>
                  )}
                  {filters.categories.map(category => (
                    <Badge key={category} variant="secondary" className="bg-blue-100 text-blue-800">
                      {category}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => handleFilterChange('categories', category, true)}
                      />
                    </Badge>
                  ))}
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  {filteredInfluencers.length} result{filteredInfluencers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Add Influencer Form */}
        {showAddForm && (
          <AddInfluencerForm 
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              fetchInfluencers();
            }}
          />
        )}

        {/* Results */}
        {filteredInfluencers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {influencers.length === 0 ? (
              <>
                <p className="text-gray-600 mb-4">No influencers added yet</p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                >
                  Add Your First Influencer
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">No influencers match your current filters</p>
                <Button 
                  onClick={clearAllFilters}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInfluencers.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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

// Category List Page Component
const CategoryListPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const categoryDisplayName = categoryName?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || '';
  
  const influencers = demoInfluencers[categoryDisplayName] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/landing')}
              className="mb-4"
            >
              ← Back to Categories
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              All {categoryDisplayName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Influencers</span>
            </h1>
            <p className="text-gray-600">
              Complete list of {categoryDisplayName.toLowerCase()} content creators on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {influencers.map((influencer) => (
              <DetailedInfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
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
            <Route path="/category/:categoryName" element={
              <ProtectedRoute>
                <CategoryListPage />
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