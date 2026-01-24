import { useState, useEffect } from 'react';
import { 
  getPopularCurrencies, 
  getCurrencyForDestination,
  convertCurrency,
  formatCurrency 
} from '../services/currencyService';
import '../styles/CurrencySelector.css';

const CurrencySelector = ({ 
  sourceCurrency, 
  targetCurrency, 
  budget,
  destination,
  onCurrencyChange 
}) => {
  const [currencies] = useState(getPopularCurrencies());
  const [selectedSource, setSelectedSource] = useState(sourceCurrency || 'USD');
  const [selectedTarget, setSelectedTarget] = useState(targetCurrency || 'USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(budget || 0);
  const [loading, setLoading] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  // Auto-detect target currency from destination
  useEffect(() => {
    if (destination) {
      const detectedCurrency = getCurrencyForDestination(destination);
      setSelectedTarget(detectedCurrency);
    }
  }, [destination]);

  // Calculate conversion whenever values change
  useEffect(() => {
    if (budget && selectedSource && selectedTarget) {
      performConversion();
    }
  }, [budget, selectedSource, selectedTarget]);

  const performConversion = async () => {
    if (!budget || budget <= 0) {
      setConvertedAmount(0);
      setExchangeRate(1);
      return;
    }

    try {
      setLoading(true);
      const result = await convertCurrency(budget, selectedSource, selectedTarget);
      setExchangeRate(result.rate);
      setConvertedAmount(result.convertedAmount);
      
      // Notify parent component
      if (onCurrencyChange) {
        onCurrencyChange({
          sourceCurrency: selectedSource,
          targetCurrency: selectedTarget,
          exchangeRate: result.rate,
          convertedAmount: result.convertedAmount
        });
      }
    } catch (error) {
      console.error('Currency conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
  };

  const handleTargetChange = (e) => {
    setSelectedTarget(e.target.value);
  };

  const getCurrencyInfo = (code) => {
    return currencies.find(c => c.code === code) || { code, name: code, symbol: code };
  };

  return (
    <div className="currency-selector">
      <div className="currency-header">
        <button 
          type="button"
          className="currency-toggle"
          onClick={() => setShowConverter(!showConverter)}
        >
          <span className="currency-icon">💱</span>
          <span>Conversor de Divisas</span>
          <span className={`toggle-arrow ${showConverter ? 'open' : ''}`}>▼</span>
        </button>
      </div>

      {showConverter && (
        <div className="currency-content">
          <div className="currency-row">
            <div className="currency-field">
              <label>Tu Moneda</label>
              <select 
                value={selectedSource} 
                onChange={handleSourceChange}
                className="currency-select"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="currency-arrow">
              →
            </div>

            <div className="currency-field">
              <label>
                Moneda del Destino
                {destination && (
                  <span className="auto-detected"> (Auto-detectada)</span>
                )}
              </label>
              <select 
                value={selectedTarget} 
                onChange={handleTargetChange}
                className="currency-select"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {budget > 0 && (
            <div className="conversion-result">
              {loading ? (
                <div className="loading-conversion">
                  <div className="spinner-small"></div>
                  <span>Calculando conversión...</span>
                </div>
              ) : (
                <>
                  <div className="conversion-summary">
                    <div className="amount-original">
                      <span className="label">Presupuesto Original:</span>
                      <span className="value">{formatCurrency(budget, selectedSource)}</span>
                    </div>
                    
                    <div className="exchange-rate">
                      <span className="rate-label">Tasa de cambio:</span>
                      <span className="rate-value">
                        1 {getCurrencyInfo(selectedSource).symbol} = {exchangeRate.toFixed(4)} {getCurrencyInfo(selectedTarget).symbol}
                      </span>
                    </div>
                    
                    <div className="amount-converted">
                      <span className="label">Equivalente en Destino:</span>
                      <span className="value highlight">{formatCurrency(convertedAmount, selectedTarget)}</span>
                    </div>
                  </div>

                  {selectedSource !== selectedTarget && (
                    <div className="conversion-note">
                      <span className="note-icon">💡</span>
                      <span>
                        Este cálculo se actualizará automáticamente en tus itinerarios
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!budget || budget <= 0 && (
            <div className="currency-hint">
              <span className="hint-icon">ℹ️</span>
              <span>Ingresa un presupuesto para ver la conversión automática</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
