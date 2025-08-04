import React from 'react';
import { useBlockchainStore } from '../stores/blockchainStore';
import { Loader, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { CURRENT_NETWORK } from '../config/blockchain';

export default function TransactionStatus() {
  const { pendingTransactions } = useBlockchainStore();

  if (pendingTransactions.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Loader className="w-4 h-4 animate-spin text-yellow-400" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Loader className="w-4 h-4 animate-spin text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'confirmed':
        return 'border-green-500 bg-green-900/20';
      case 'failed':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getExplorerUrl = (hash: string) => {
    return `${CURRENT_NETWORK.blockExplorerUrls[0]}/tx/${hash}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {pendingTransactions.map((tx) => (
        <div
          key={tx.hash}
          className={`border rounded-lg p-3 ${getStatusColor(tx.status)} backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(tx.status)}
              <span className="text-white text-sm font-medium">
                {tx.status === 'pending' && 'Transaction Pending'}
                {tx.status === 'confirmed' && 'Transaction Confirmed'}
                {tx.status === 'failed' && 'Transaction Failed'}
              </span>
            </div>
            
            <a
              href={getExplorerUrl(tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            <div>Hash: {formatTxHash(tx.hash)}</div>
            {tx.confirmations > 0 && (
              <div>Confirmations: {tx.confirmations}</div>
            )}
            {tx.error && (
              <div className="text-red-400 mt-1">{tx.error}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
