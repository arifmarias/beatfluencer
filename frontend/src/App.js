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
import { Search, Users, Building, Megaphone, Plus, Filter, Star, MapPin, Calendar, Eye, TrendingUp, Heart, MessageCircle, Share2, Instagram, Youtube, Facebook, UserCheck, Edit, LogOut, Menu, X, ChevronDown, ChevronUp, Sparkles, Zap, Target, BarChart3, Globe, Camera, Video, Mic, Gamepad2, Shirt, Utensils, Dumbbell, Code, Palette, Music } from "lucide-react";

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

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Modal Component
const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      onClose();
      setEmail('');
      setPassword('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-xl animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Beatfluencer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#categories" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Categories
              </Link>
              <Link to="#trending" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Trending
              </Link>
              <Link to="#about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                About
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
                  <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                    Dashboard
                  </Link>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-gray-500 capitalize">{user.role?.replace('_', ' ')}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105"
                >
                  Login
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
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
              <div className="space-y-2">
                <Link to="#categories" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                  Categories
                </Link>
                <Link to="#trending" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                  Trending
                </Link>
                <Link to="#about" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                  About
                </Link>
                
                {user ? (
                  <div className="pt-4 border-t">
                    <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                      Dashboard
                    </Link>
                    <div className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.role?.replace('_', ' ')}</div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => setShowLoginModal(true)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      Login
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

// Influencer Card Component
const InfluencerCard = ({ influencer, isExpanded = false }) => {
  const totalFollowers = influencer.social_media_accounts?.reduce((sum, account) => sum + account.follower_count, 0) || 0;
  const platforms = influencer.social_media_accounts || [];
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {influencer.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
              {influencer.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{influencer.account_type}</p>
            {influencer.featured_creators && (
              <Badge className="mt-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-bounce">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-gray-900">
              {totalFollowers.toLocaleString()}
            </span>
            <span className="text-gray-600">followers</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{influencer.division}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {influencer.categories?.slice(0, 2).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs border-indigo-200 text-indigo-700">
              {category}
            </Badge>
          ))}
          {influencer.categories?.length > 2 && (
            <Badge variant="outline" className="text-xs border-gray-200">
              +{influencer.categories.length - 2} more
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="flex space-x-2">
            {platforms.map((account, index) => (
              <div key={index} className="relative group/icon">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-300">
                  {account.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500 group-hover/icon:text-white" />}
                  {account.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500 group-hover/icon:text-white" />}
                  {account.platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-500 group-hover/icon:text-white" />}
                  {account.platform === 'tiktok' && <Video className="w-4 h-4 text-black group-hover/icon:text-white" />}
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity">
                  {account.follower_count.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
            <Eye className="w-3 h-3 mr-1" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Category Card Component
const CategoryCard = ({ category, icon: Icon, color, onClick, isExpanded, influencers }) => {
  return (
    <div className="space-y-6">
      <Card 
        className={`cursor-pointer transition-all duration-700 transform hover:scale-105 hover:shadow-2xl border-0 overflow-hidden ${
          isExpanded 
            ? 'bg-gradient-to-br from-white to-gray-50 shadow-2xl' 
            : 'bg-gradient-to-br from-white via-gray-50 to-white shadow-lg hover:shadow-xl'
        }`}
        onClick={onClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`}></div>
        <CardContent className="relative p-8 text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-500 ${isExpanded ? 'rotate-12 scale-110' : ''}`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{category}</h3>
          <p className="text-gray-600 mb-4">Discover amazing creators</p>
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <span className="text-sm font-medium">
              {isExpanded ? 'Show Less' : 'Explore'}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardContent>
      </Card>

      {isExpanded && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.slice(0, 9).map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} isExpanded={true} />
            ))}
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View All</h3>
                <p className="text-gray-600 mb-4">See complete list of {category} influencers</p>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  Full List
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [trendingInfluencers, setTrendingInfluencers] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryInfluencers, setCategoryInfluencers] = useState({});
  const { token } = useAuth();

  const categories = [
    { name: 'Lifestyle', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
    { name: 'Technology', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { name: 'Food & Cooking', icon: Utensils, color: 'from-orange-500 to-red-500' },
    { name: 'Fashion & Style', icon: Shirt, color: 'from-purple-500 to-indigo-500' },
    { name: 'Fitness & Health', icon: Dumbbell, color: 'from-green-500 to-teal-500' },
    { name: 'Beauty & Cosmetics', icon: Palette, color: 'from-pink-500 to-purple-500' },
    { name: 'Gaming', icon: Gamepad2, color: 'from-indigo-500 to-blue-500' },
    { name: 'Music & Entertainment', icon: Music, color: 'from-yellow-500 to-orange-500' }
  ];

  const [filters, setFilters] = useState({
    platform: '',
    gender: '',
    minFollowers: '',
    maxFollowers: '',
    division: '',
    experience: ''
  });

  useEffect(() => {
    fetchTrendingInfluencers();
  }, []);

  const fetchTrendingInfluencers = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/influencers?status=published`, { headers });
      const trending = response.data
        .filter(inf => inf.featured_creators || inf.total_campaigns > 5)
        .slice(0, 8);
      setTrendingInfluencers(trending);
    } catch (error) {
      console.error('Error fetching trending influencers:', error);
    }
  };

  const handleCategoryClick = async (category) => {
    if (expandedCategory === category.name) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(category.name);
    
    if (!categoryInfluencers[category.name]) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(
          `${API}/search/influencers?category=${encodeURIComponent(category.name)}`,
          { headers }
        );
        setCategoryInfluencers(prev => ({
          ...prev,
          [category.name]: response.data.slice(0, 10)
        }));
      } catch (error) {
        console.error('Error fetching category influencers:', error);
      }
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
      if (filters.division) params.append('division', filters.division);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/search/influencers?${params.toString()}`, { headers });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching influencers:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%), url('https://images.unsplash.com/photo-1553532434-5ab5b6b84993?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxnZW9tZXRyaWMlMjBwYXR0ZXJuc3xlbnwwfHx8fDE3NTU2Nzk3MjJ8MA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-pink-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Find Your Perfect{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse">
                Influencer
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto">
              Discover and connect with the most impactful creators across all platforms. 
              Search with natural language and find your brand's perfect match.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="e.g., 'Instagram lifestyle influencer with 100K+ followers in Dhaka under 10000 BDT'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-14 text-lg border-2 border-gray-200 rounded-2xl shadow-lg focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-16 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Search className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full px-6 py-3"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>
            
            {showAdvancedFilters && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Platform</Label>
                    <Select value={filters.platform} onValueChange={(value) => setFilters({...filters, platform: value})}>
                      <SelectTrigger className="h-12 rounded-xl">
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
                    <Label className="text-sm font-semibold text-gray-700">Gender</Label>
                    <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                      <SelectTrigger className="h-12 rounded-xl">
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
                    <Label className="text-sm font-semibold text-gray-700">Location</Label>
                    <Select value={filters.division} onValueChange={(value) => setFilters({...filters, division: value})}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dhaka">Dhaka</SelectItem>
                        <SelectItem value="Chittagong">Chittagong</SelectItem>
                        <SelectItem value="Sylhet">Sylhet</SelectItem>
                        <SelectItem value="Rajshahi">Rajshahi</SelectItem>
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
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
              <Badge className="bg-indigo-100 text-indigo-800 px-4 py-2">
                {searchResults.length} found
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing creators in your preferred content categories
            </p>
          </div>
          
          <div className="space-y-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category.name}
                icon={category.icon}
                color={category.color}
                isExpanded={expandedCategory === category.name}
                influencers={categoryInfluencers[category.name] || []}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Influencers */}
      <section id="trending" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              <Zap className="inline w-10 h-10 text-yellow-500 mr-3" />
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Creators</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Most popular and high-performing influencers right now
            </p>
          </div>
          
          {trendingInfluencers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingInfluencers.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No trending influencers available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl">
                  <Sparkles className="h-8 w-8" />
                </div>
                <span className="text-3xl font-bold">Beatfluencer</span>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                The ultimate platform for discovering and connecting with the most impactful influencers across all social media platforms.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <Youtube className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Facebook className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Influencers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trending</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Beatfluencer. All rights reserved. Built with ❤️ for creators and brands.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Dashboard Component (for logged-in users)
const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Role: <span className="capitalize font-semibold">{user?.role?.replace('_', ' ')}</span>
            </p>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Features Coming Soon</h2>
              <p className="text-gray-600">
                Your personalized dashboard with analytics, campaign management, and advanced tools is being built.
              </p>
            </div>
          </div>
        </div>
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;