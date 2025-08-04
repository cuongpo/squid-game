// Mock Sequence WaaS for demonstration (replace with real import when packages are installed)
// import { SequenceWaaS } from '@0xsequence/waas';
import { ethers } from 'ethers';
import { WalletState } from '../types/blockchain';
import { ETHERLINK_TESTNET, ETHERLINK_MAINNET } from '../config/blockchain';

// Mock SequenceWaaS class for demonstration
class MockSequenceWaaS {
  private config: any;
  
  constructor(config: any) {
    this.config = config;
  }
  
  async signIn(credentials: { idToken: string }, sessionName: string): Promise<string> {
    // Mock wallet address generation
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    return '0x' + Math.random().toString(16).substring(2, 42).padStart(40, '0');
  }
  
  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export interface SequenceWalletConfig {
  network: string;
  projectAccessKey: string;
  waasConfigKey: string;
}

export class SequenceWalletService {
  private sequenceWaas: MockSequenceWaaS | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private walletAddress: string | null = null;
  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.initializeSequence();
  }

  private initializeSequence() {
    const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
    const config: SequenceWalletConfig = {
      network: isMainnet ? 'etherlink' : 'etherlink-testnet',
      projectAccessKey: import.meta.env.VITE_SEQUENCE_PROJECT_ACCESS_KEY || '',
      waasConfigKey: import.meta.env.VITE_SEQUENCE_WAAS_CONFIG_KEY || '',
    };

    if (!config.projectAccessKey || !config.waasConfigKey) {
      console.error('Sequence configuration missing. Please check your .env file.');
      return;
    }

    try {
      this.sequenceWaas = new MockSequenceWaaS(config);
      console.log(`✅ Sequence WaaS initialized (${isMainnet ? 'Mainnet' : 'Testnet'} Mode)`);
    } catch (error) {
      console.error('❌ Failed to initialize Sequence WaaS:', error);
    }
  }

  public addListener(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (state: WalletState) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(state: WalletState) {
    this.listeners.forEach(listener => listener(state));
  }

  public async connectWallet(): Promise<WalletState> {
    if (!this.sequenceWaas) {
      throw new Error('Sequence WaaS not initialized');
    }

    try {
      // For demo purposes, we'll use a mock OIDC token
      // In a real app, you'd integrate with Google, Apple, or other OIDC providers
      const mockIdToken = await this.getMockIdToken();
      
      console.log('🔐 Signing in with Sequence...');
      this.walletAddress = await this.sequenceWaas.signIn(
        { idToken: mockIdToken }, 
        `squid-game-session-${Date.now()}`
      );

      console.log('✅ Sequence wallet connected:', this.walletAddress);

      // Initialize provider for the correct network
      await this.initializeProvider();

      const state = await this.getWalletState();
      this.notifyListeners(state);
      return state;

    } catch (error: any) {
      console.error('❌ Failed to connect Sequence wallet:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  private async getMockIdToken(): Promise<string> {
    // In a real application, you would integrate with an OIDC provider
    // For demo purposes, we'll create a mock token
    // This should be replaced with actual Google/Apple/etc. authentication
    
    return new Promise((resolve) => {
      // Simulate user authentication
      setTimeout(() => {
        // This is a mock JWT token for demo purposes
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNxdWlkIEdhbWUgUGxheWVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.mock-signature';
        resolve(mockToken);
      }, 1000);
    });
  }

  private async initializeProvider() {
    try {
      // Use the correct network based on environment
      const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
      const networkConfig = isMainnet ? ETHERLINK_MAINNET : ETHERLINK_TESTNET;
      const rpcUrl = networkConfig.rpcUrls[0];
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // For Sequence, we'll use the wallet address to create a signer
      // In a real implementation, you'd use Sequence's provider
      if (this.walletAddress) {
        // This is a simplified approach - in production you'd use Sequence's signer
        this.signer = new ethers.Wallet(
          // This would be handled by Sequence's infrastructure
          '0x' + '1'.repeat(64), // Mock private key - Sequence handles this securely
          this.provider
        );
      }

      console.log(`✅ Provider initialized for ${isMainnet ? 'Etherlink Mainnet' : 'Etherlink Testnet'}`);
    } catch (error) {
      console.error('❌ Failed to initialize provider:', error);
      throw error;
    }
  }

  public async getWalletState(): Promise<WalletState> {
    if (!this.walletAddress || !this.provider) {
      return {
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null,
        isCorrectNetwork: false,
      };
    }

    try {
      const balance = await this.provider.getBalance(this.walletAddress);
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Check if we're on the correct network
      const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
      const expectedChainId = isMainnet ? ETHERLINK_MAINNET.chainId : ETHERLINK_TESTNET.chainId;

      return {
        isConnected: true,
        address: this.walletAddress,
        balance: ethers.formatEther(balance),
        chainId,
        isCorrectNetwork: chainId === expectedChainId,
      };
    } catch (error) {
      console.error('❌ Failed to get wallet state:', error);
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
    try {
      if (this.sequenceWaas) {
        // Sequence handles session cleanup
        await this.sequenceWaas.signOut();
      }
    } catch (error) {
      console.error('❌ Error during sign out:', error);
    }

    this.walletAddress = null;
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

  public async switchToEtherlinkTestnet(): Promise<void> {
    // Sequence handles network switching automatically
    // This method is kept for compatibility with the existing interface
    const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
    console.log(`✅ Sequence automatically handles network switching to ${isMainnet ? 'Mainnet' : 'Testnet'}`);
  }

  public getProvider(): ethers.Provider | null {
    return this.provider;
  }

  public getSigner(): ethers.Signer | null {
    return this.signer;
  }

  public isWalletInstalled(): boolean {
    // Sequence doesn't require installation - it's embedded
    return true;
  }

  public getWalletAddress(): string | null {
    return this.walletAddress;
  }

  public isSequenceWallet(): boolean {
    return true;
  }

  // Method to handle real OIDC authentication (to be implemented)
  public async authenticateWithGoogle(): Promise<string> {
    // This would integrate with Google OAuth
    // For now, return mock token
    return this.getMockIdToken();
  }

  public async authenticateWithApple(): Promise<string> {
    // This would integrate with Apple Sign In
    // For now, return mock token
    return this.getMockIdToken();
  }

  public async authenticateWithEmail(email: string): Promise<string> {
    // This would integrate with email-based authentication
    // For now, return mock token
    console.log('Authenticating with email:', email);
    return this.getMockIdToken();
  }
}

export const sequenceWalletService = new SequenceWalletService();
