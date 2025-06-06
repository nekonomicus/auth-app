import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component with Navigation
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-header">
          <h1 className="form-title">Muckeltreff.de</h1>
          <p className="form-tagline">🐹 Willkommen zurück!</p>
        </div>
        <h2>Anmelden</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

// Register Component with Navigation
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password
      });
      setSuccess('Registration successful!');
      login(response.data.token, response.data.user);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-header">
          <h1 className="form-title">Muckeltreff.de</h1>
          <p className="form-tagline">🐹 Werde ein Muckel!</p>
        </div>
        <h2>Registrieren</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rodentifyText = (text) => {
    // Transform text to rodent speak
    const rodentWords = {
      'hello': '*quietscht* Hallo',
      'yes': '*nick nick* Ja ja',
      'no': '*schüttel* Nein nein',
      'good': 'super-duper-muckel-gut',
      'bad': 'nicht so muckel-mäßig',
      'food': 'Körner und Nüsschen',
      'eat': 'mümmeln',
      'run': 'im Laufrad rennen',
      'sleep': 'im Nest kuscheln',
      'friend': 'Muckel-Kumpel',
      'love': '❤️ muckel-lieb haben ❤️',
      'happy': '🐹 quietsch-fröhlich 🐹',
      'thank': '*verbeug* Muckel-Danke',
      'you': 'du süßer Muckel',
      'I': 'ich kleiner Hamster',
      'the': 'das',
      'is': 'ist total',
      'are': 'sind sowas von',
      'what': '*neugierig schnüffel* Was',
      'how': '*Köpfchen schief leg* Wie',
      'why': '*verwirrt quietsch* Warum'
    };

    let result = text;
    
    // Add random squeaks and rodent sounds
    const sounds = ['*quietsch*', '*schnüffel*', '*müffel*', '*knabber*', '*fiep*'];
    const randomSound = () => sounds[Math.floor(Math.random() * sounds.length)];
    
    // Replace words with rodent versions
    Object.entries(rodentWords).forEach(([normal, rodent]) => {
      const regex = new RegExp(`\\b${normal}\\b`, 'gi');
      result = result.replace(regex, rodent);
    });
    
    // Add random sounds between sentences
    result = result.replace(/\./g, `. ${randomSound()}`);
    result = result.replace(/\?/g, `? ${randomSound()}`);
    result = result.replace(/!/g, `! ${randomSound()}`);
    
    // Add ending
    const endings = [
      '*putzt sich das Fell*',
      '*versteckt Nüsschen*',
      '*rennt ins Laufrad*',
      '*knabbert zufrieden*',
      '*macht Männchen*'
    ];
    
    result = `${randomSound()} ${result} ${endings[Math.floor(Math.random() * endings.length)]}`;
    
    return result;
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setIsLoading(true);
    setChatResponse('');
    
    try {
      // Using a simple approach - generate a fun response based on keywords
      const lowerMessage = chatMessage.toLowerCase();
      let response = '';
      
      if (lowerMessage.includes('wetter') || lowerMessage.includes('weather')) {
        response = "Das Wetter ist perfekt zum Körnchen sammeln! Die Sonne scheint warm auf mein Fell.";
      } else if (lowerMessage.includes('essen') || lowerMessage.includes('food') || lowerMessage.includes('hunger')) {
        response = "Ohhh, Essen! Ich liebe Sonnenblumenkerne, Möhrchen und frisches Grünzeug! Was ist dein Lieblings-Knabberzeug?";
      } else if (lowerMessage.includes('liebe') || lowerMessage.includes('love')) {
        response = "Liebe ist wenn man seine Lieblings-Nüsschen teilt! Ich hab dich auch lieb, Muckel-Freund!";
      } else if (lowerMessage.includes('sport') || lowerMessage.includes('lauf')) {
        response = "Ich renne jede Nacht 5 Kilometer in meinem Laufrad! Das hält fit und macht Spaß!";
      } else if (lowerMessage.includes('müde') || lowerMessage.includes('tired') || lowerMessage.includes('schlaf')) {
        response = "Zeit für ein Nickerchen im kuscheligen Nest! Hamster brauchen 14 Stunden Schlaf am Tag!";
      } else if (lowerMessage.includes('wie geht') || lowerMessage.includes('how are')) {
        response = "Mir geht's hammster-mäßig gut! Meine Backen sind voll und mein Fell ist flauschig!";
      } else {
        const genericResponses = [
          "Das ist ja interessant! Erzähl mir mehr davon während ich diese Nuss knabbere!",
          "Ui ui ui, das klingt spannend! Ich verstecke das mal in meinen Backentaschen zum später drüber nachdenken!",
          "Weißt du was? Du bist ein ganz toller Muckel! Lass uns Freunde sein!",
          "Ich bin zwar nur ein kleiner Hamster, aber ich höre dir gerne zu!",
          "Das erinnert mich an die Zeit, als ich mein erstes Sonnenblumenkernchen gefunden habe!"
        ];
        response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }
      
      // Apply rodent language transformation
      const rodentResponse = rodentifyText(response);
      
      // Simulate typing effect
      let index = 0;
      const typeWriter = () => {
        if (index < rodentResponse.length) {
          setChatResponse(prev => prev + rodentResponse[index]);
          index++;
          setTimeout(typeWriter, 30);
        }
      };
      
      setTimeout(() => {
        setChatResponse('');
        typeWriter();
        setChatMessage(''); // Clear input after sending
      }, 500);
      
    } catch (error) {
      setChatResponse('*verschüchtert quietsch* Oh nein, da ist was schief gelaufen! *versteckt sich*');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="site-header">
        <h1 className="site-title">Muckeltreff.de</h1>
        <p className="site-tagline">Der gemütlichste Treffpunkt im Netz!</p>
      </div>
      
      <div className="hamster-container">
        <div className="hamster">
          <div className="hamster-body">
            <div className="hamster-ear left"></div>
            <div className="hamster-ear right"></div>
            <div className="hamster-eye left"></div>
            <div className="hamster-eye right"></div>
            <div className="hamster-nose"></div>
            <div className="hamster-mouth"></div>
            <div className="hamster-whisker left"></div>
            <div className="hamster-whisker right"></div>
          </div>
          <div className="hamster-wheel">
            <div className="wheel-spoke"></div>
            <div className="wheel-spoke"></div>
            <div className="wheel-spoke"></div>
            <div className="wheel-spoke"></div>
          </div>
        </div>
        <div className="welcome-message">
          <h2>Willkommen, {user?.email?.split('@')[0]}! 🐹</h2>
        </div>
      </div>

      <div className="user-info">
        <h3>Dein Muckel-Profil:</h3>
        <p>📧 Email: {user?.email}</p>
        <p>✅ Verifiziert: {user?.verified ? 'Ja' : 'Nein'}</p>
        <p>📅 Muckel seit: {new Date(user?.created_at).toLocaleDateString('de-DE')}</p>
      </div>

      <div className="muckel-chat">
        <h3>🐹 Muckel-Chat - Frag mich was!</h3>
        <form onSubmit={handleChat} className="chat-form">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Stell dem Muckel eine Frage..."
            disabled={isLoading}
            className="chat-input"
          />
          <button type="submit" disabled={isLoading} className="chat-button">
            {isLoading ? '🐹 *denkt nach*...' : '📨 Fragen'}
          </button>
        </form>
        {chatResponse && (
          <div className="chat-response">
            <div className="chat-bubble">
              <span className="chat-avatar">🐹</span>
              <p className="chat-text">{chatResponse}</p>
            </div>
          </div>
        )}
      </div>
      
      <button onClick={handleLogout} className="logout-btn">Tschüss sagen</button>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;