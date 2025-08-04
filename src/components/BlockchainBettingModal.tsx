import React, { useState } from 'react';
import { useBlockchainStore } from '../stores/blockchainStore';
import { MIN_BET_AMOUNT, MAX_BET_AMOUNT } from '../config/blockchain';
import { X, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import type { Contestant } from '../types';

interface BlockchainBettingModalProps {
  contestant: Contestant;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlockchainBettingModal({ 
  contestant, 
  isOpen, 
  onClose 
}: BlockchainBettingModalProps) {
  const { 
    walletState, 
    isPlacingBet, 
    placeBet 
  } = useBlockchainStore();
  
  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBetAmountChange = (value: string) => {
    setError(null);
    setSuccess(null);
    setBetAmount(value);
  };

  const validateBetAmount = (): boolean => {
    const amount = parseFloat(betAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bet amount');
      return false;
    }
    
    if (amount < parseFloat(MIN_BET_AMOUNT)) {
      setError(`Minimum bet amount is ${MIN_BET_AMOUNT} XTZ`);
      return false;
    }

    if (amount > parseFloat(MAX_BET_AMOUNT)) {
      setError(`Maximum bet amount is ${MAX_BET_AMOUNT} XTZ`);
      return false;
    }

    const userBalance = parseFloat(walletState.balance);
    if (amount > userBalance) {
      setError('Insufficient XTZ balance');
      return false;
    }
    
    return true;
  };

  const handlePlaceBet = async () => {
    if (!validateBetAmount()) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      const betId = await placeBet(contestant.id, betAmount, contestant.currentOdds);
      setSuccess(`Bet placed successfully! Bet ID: ${betId}`);
      setBetAmount('');
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const calculatePotentialPayout = (): string => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount)) return '0';
    return (amount * contestant.currentOdds).toFixed(4);
  };

  const quickAmounts = ['0.1', '0.5', '1.0', '2.0'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Place Bet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contestant Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={contestant.imageUrl}
                alt={contestant.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-white font-semibold">{contestant.name}</h3>
                <p className="text-gray-400 text-sm">#{contestant.number}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">{contestant.currentOdds.toFixed(2)}x odds</span>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Your XTZ Balance</div>
            <div className="text-white font-semibold">
              {parseFloat(walletState.balance).toFixed(4)} XTZ
            </div>
          </div>

          {/* Bet Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount (XTZ)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => handleBetAmountChange(e.target.value)}
              placeholder={`Min: ${MIN_BET_AMOUNT} XTZ`}
              min={MIN_BET_AMOUNT}
              max={MAX_BET_AMOUNT}
              step="0.01"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-squid-pink focus:outline-none"
            />
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleBetAmountChange(amount)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Payout */}
          {betAmount && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <div className="text-sm text-green-400 mb-1">Potential Payout</div>
              <div className="text-green-300 font-semibold text-lg">
                {calculatePotentialPayout()} XTZ
              </div>
              <div className="text-green-400 text-sm">
                Profit: {(parseFloat(calculatePotentialPayout()) - parseFloat(betAmount || '0')).toFixed(4)} XTZ
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
              <div className="text-green-400 text-sm">{success}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={!betAmount || isPlacingBet || !walletState.isConnected || !walletState.isCorrectNetwork}
              className="flex-1 bg-squid-pink hover:bg-squid-pink/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isPlacingBet ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Placing Bet...
                </>
              ) : (
                'Place Bet'
              )}
            </button>
          </div>

          {/* Betting Limits */}
          <div className="text-xs text-gray-500 text-center">
            Betting limits: {MIN_BET_AMOUNT} - {MAX_BET_AMOUNT} XTZ
          </div>
        </div>
      </div>
    </div>
  );
}
