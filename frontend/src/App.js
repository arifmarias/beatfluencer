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
import { Search, Users, Building, Megaphone, Plus, Filter, Star, MapPin, Calendar, Eye, TrendingUp, Heart, MessageCircle, Share2, Instagram, Youtube, Facebook, UserCheck, Edit, LogOut, Menu, X, ChevronDown, ChevronUp, Sparkles, Zap, Target, BarChart3, Globe, Camera, Video, Mic, Gamepad2, Shirt, Utensils, Dumbbell, Code, Palette, Music, Home, DollarSign, Activity, Layers, PieChart, LineChart, Users2, ExternalLink, Verified, Award, Crown } from "lucide-react";

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
const DetailedInfluencerCard = ({ influencer }) => {
  const { user } = useAuth();
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => sum + account.follower_count, 0) || 0;
  
  const age = influencer.date_of_birth 
    ? new Date().getFullYear() - new Date(influencer.date_of_birth).getFullYear()
    : null;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-md overflow-hidden h-full max-w-sm">
      <div className="relative">
        {/* Clean Profile Image - No Overlays */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={influencer.profile_image} 
            alt={influencer.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Profile Info - Clean Layout */}
        <div className="text-center">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{influencer.name}</h3>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-2">
            <span className="capitalize">{influencer.account_type}</span>
            {age && <span>{age} years</span>}
            <span>{influencer.division}</span>
          </div>
          
          {/* Badges Row */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            {influencer.verification_status && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                <Verified className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {influencer.featured_creators && (
              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        
        {/* Total Followers - Prominent Display */}
        <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">
              {totalFollowers > 1000000 
                ? `${(totalFollowers / 1000000).toFixed(1)}M` 
                : totalFollowers > 1000 
                ? `${(totalFollowers / 1000).toFixed(0)}K`
                : totalFollowers.toLocaleString()
              }
            </span>
          </div>
          <span className="text-sm text-gray-600 font-medium">Total Followers</span>
        </div>
        
        {/* Categories - Compact */}
        <div className="flex flex-wrap gap-1 justify-center">
          {influencer.categories?.slice(0, 3).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
              {category}
            </Badge>
          ))}
        </div>
        
        {/* Collapsible Social Media Section */}
        <div className="border-t border-gray-100 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSocialMedia(!showSocialMedia)}
            className="w-full text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Globe className="w-4 h-4 mr-2" />
            Social Media Presence
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showSocialMedia ? 'rotate-180' : ''}`} />
          </Button>
          
          {showSocialMedia && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {influencer.social_media_accounts?.map((account, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {account.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                    {account.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                    {account.platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                    {account.platform === 'tiktok' && <Video className="w-4 h-4 text-black" />}
                    <span className="font-medium capitalize">{account.platform}</span>
                    {account.verification_status && (
                      <Verified className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
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
        
        {/* Action Button */}
        <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200">
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 9 Influencer Cards */}
            {influencers.slice(0, 9).map((influencer) => (
              <DetailedInfluencerCard key={influencer.id} influencer={influencer} />
            ))}
            
            {/* 10th Card - Full List */}
            <Card 
              className="cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-dashed border-indigo-300 flex items-center justify-center min-h-[400px] max-w-sm"
              onClick={() => navigate(`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              <CardContent className="text-center p-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                  <ExternalLink className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">View All</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Explore the complete collection of {category.name} influencers
                </p>
                <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 w-full text-sm">
                  <Layers className="w-4 h-4 mr-2" />
                  Browse Full Category
                </Button>
                <div className="mt-4">
                  <Badge className="bg-indigo-100 text-indigo-800 px-4 py-2 text-sm font-semibold">
                    {influencers.length}+ creators
                  </Badge>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {categories.map((category) => (
              <Card 
                key={category.name}
                className="cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0 shadow-lg overflow-hidden"
                onClick={() => handleCategoryClick(category)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10`}></div>
                <CardContent className="relative p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform duration-500 hover:rotate-6 hover:scale-105 shadow-lg`}>
                    <category.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                  <p className="text-gray-600 mb-4">Discover amazing creators</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge className={`bg-gradient-to-r ${category.color} text-white px-3 py-1`}>
                      {demoInfluencers[category.name]?.length || 0} creators
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-indigo-600 mt-4">
                    <span className="text-sm font-medium">Click to Explore</span>
                    <Eye className="w-4 h-4" />
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