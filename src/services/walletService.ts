import { ethers } from 'ethers';
import { CURRENT_NETWORK } from '../config/blockchain';
import type { WalletState } from '../types/blockchain';

declare global {
  interface Window {
    ethereum?: any;
  }
}

class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
    }
  }

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      this.handleDisconnect();
    } else {
      this.updateWalletState();
    }
  }

  private handleChainChanged(chainId: string) {
    this.updateWalletState();
  }

  private handleDisconnect() {
    this.provider = null;
    this.signer = null;
    this.notifyListeners({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      isCorrectNetwork: false,
    });
  }

  private async updateWalletState() {
    const state = await this.getWalletState();
    this.notifyListeners(state);
  }

  private notifyListeners(state: WalletState) {
    this.listeners.forEach(listener => listener(state));
  }

  public onWalletStateChange(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public async connectWallet(): Promise<WalletState> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== CURRENT_NETWORK.chainId) {
        await this.switchToCorrectNetwork();
      }

      const state = await this.getWalletState();
      this.notifyListeners(state);
      return state;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  public async switchToCorrectNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to current network (mainnet or testnet)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
              chainName: CURRENT_NETWORK.chainName,
              nativeCurrency: CURRENT_NETWORK.nativeCurrency,
              rpcUrls: CURRENT_NETWORK.rpcUrls,
              blockExplorerUrls: CURRENT_NETWORK.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  public async getWalletState(): Promise<WalletState> {
    if (!this.provider || !this.signer) {
      return {
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null,
        isCorrectNetwork: false,
      };
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      return {
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        chainId,
        isCorrectNetwork: chainId === CURRENT_NETWORK.chainId,
      };
    } catch (error) {
      console.error('Failed to get wallet state:', error);
      return {
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null,
        isCorrectNetwork: false,
      };
    }
  }

  public async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.notifyListeners({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      isCorrectNetwork: false,
    });
  }

  public getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  public getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  public isWalletInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }
}

export const walletService = new WalletService();

// Export types for convenience
export type { WalletState } from '../types/blockchain';
