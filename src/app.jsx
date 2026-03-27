const { useState, useEffect, useContext, createContext, useMemo } = React;

const API_URL = 'https://api.coingecko.com/api/v3';

// Fallback data in case of API rate limit
const fallbackData = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, price_change_percentage_24h: 2.5, market_cap: 1200000000000, high_24h: 66000, low_24h: 63000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3500, price_change_percentage_24h: -1.2, market_cap: 400000000000, high_24h: 3600, low_24h: 3400, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1, price_change_percentage_24h: 0.01, market_cap: 100000000000, high_24h: 1.01, low_24h: 0.99, image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 580, price_change_percentage_24h: 5.4, market_cap: 90000000000, high_24h: 590, low_24h: 550, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 150, price_change_percentage_24h: 8.2, market_cap: 65000000000, high_24h: 155, low_24h: 135, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' }
];

const fetchTopCryptos = async () => {
  try {
    const response = await fetch(`${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Rate limit exceeded. Using fallback data.");
        return { data: fallbackData, error: "Rate limit exceeded. Showing cached data." };
      }
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("API error:", error);
    return { data: fallbackData, error: "Network error or API offline. Showing cached data." };
  }
};

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('crypto_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('crypto_darkmode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('crypto_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('crypto_darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const { data, fetchError } = await fetchTopCryptos();
    if (data) setCryptos(data);
    if (fetchError) setError(fetchError);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleWatchlist = (id) => {
    setWatchlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <StoreContext.Provider value={{ cryptos, loading, error, watchlist, toggleWatchlist, loadData, darkMode, toggleDarkMode }}>
      {children}
    </StoreContext.Provider>
  );
};

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.43l5.67-5.67"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const AssetModal = ({ asset, onClose }) => {
  if (!asset) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="card-header">
          <div className="crypto-id">
            <img src={asset.image} alt={asset.name} />
            <div>
              <div className="crypto-name">{asset.name}</div>
              <div className="crypto-symbol">{asset.symbol}</div>
            </div>
          </div>
        </div>
        <div className="price-info">
          <div className="price">${asset.current_price.toLocaleString()}</div>
          <div className={`change ${asset.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
            {asset.price_change_percentage_24h >= 0 ? '▲' : '▼'}
            {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
          </div>
        </div>
        
        <div className="details-grid">
          <div className="detail-item">
            <span>Market Cap</span>
            <strong>${asset.market_cap.toLocaleString()}</strong>
          </div>
          <div className="detail-item">
            <span>24h High</span>
            <strong>${asset.high_24h ? asset.high_24h.toLocaleString() : 'N/A'}</strong>
          </div>
          <div className="detail-item">
            <span>24h Low</span>
            <strong>${asset.low_24h ? asset.low_24h.toLocaleString() : 'N/A'}</strong>
          </div>
          <div className="detail-item">
            <span>Circulating Supply</span>
            <strong>{asset.circulating_supply ? asset.circulating_supply.toLocaleString() : 'N/A'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const CryptoCard = ({ asset, onClick }) => {
  const { watchlist, toggleWatchlist } = useContext(StoreContext);
  const isStarred = watchlist.includes(asset.id);

  const handleStar = (e) => {
    e.stopPropagation();
    toggleWatchlist(asset.id);
  };

  return (
    <div className="crypto-card" onClick={() => onClick(asset)}>
      <div className="card-header">
        <div className="crypto-id">
          <img src={asset.image} alt={asset.name} />
          <div>
            <div className="crypto-name">{asset.name}</div>
            <div className="crypto-symbol">{asset.symbol}</div>
          </div>
        </div>
        <button 
          className={`star-btn ${isStarred ? 'starred' : ''}`}
          onClick={handleStar}
          title="Add to Watchlist"
        >
          ★
        </button>
      </div>
      <div className="price-info">
        <div className="price">${asset.current_price.toLocaleString()}</div>
        <div className={`change ${asset.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
          {asset.price_change_percentage_24h >= 0 ? '▲' : '▼'}
          {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>
      <div className="market-cap">
        MCap: ${asset.market_cap.toLocaleString()}
      </div>
    </div>
  );
};

const App = () => {
  const { cryptos, loading, error, loadData, darkMode, toggleDarkMode, watchlist } = useContext(StoreContext);
  const [search, setSearch] = useState('');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const filteredCryptos = useMemo(() => {
    return cryptos.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.symbol.toLowerCase().includes(search.toLowerCase());
      const matchWatchlist = showWatchlistOnly ? watchlist.includes(c.id) : true;
      return matchSearch && matchWatchlist;
    });
  }, [cryptos, search, showWatchlistOnly, watchlist]);

  return (
    <div>
      <header>
        <h1>Market Pulse</h1>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={toggleDarkMode} title="Toggle Dark Mode" style={{padding: '0.5rem', borderRadius: '50%'}}>
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        <div className="controls">
          <input 
            type="text" 
            placeholder="Search assets by name or symbol..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{display: 'flex', gap: '1rem'}}>
            <button onClick={() => setShowWatchlistOnly(!showWatchlistOnly)} style={{borderColor: showWatchlistOnly ? 'var(--accent)' : undefined}}>
              {showWatchlistOnly ? '★ Watchlist Only' : '☆ Show All'}
            </button>
            <button onClick={loadData} disabled={loading}>
              <RefreshIcon /> {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && cryptos.length === 0 && <div className="loader"></div>}

        {!loading && filteredCryptos.length === 0 && (
          <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>
            No assets found matching your criteria.
          </div>
        )}

        <div className="crypto-grid">
          {filteredCryptos.map(asset => (
            <CryptoCard key={asset.id} asset={asset} onClick={setSelectedAsset} />
          ))}
        </div>
      </div>

      <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
