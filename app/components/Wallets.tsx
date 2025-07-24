'use client'
import { useRef, useState, useEffect } from "react";
import { Button } from "./Button";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { config } from "../../lib/config";

interface WalletData {
    address: string;
    privateKey: string;
    index: number;
    balance?: number;
    isLoadingBalance?: boolean;
}

export function Wallets({ seed }: { seed: string }) {
    const [keypairs, setKeyPairs] = useState<WalletData[]>([]);
    const [showPrivateKeys, setShowPrivateKeys] = useState<{ [key: number]: boolean }>({});
    const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({});
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<'devnet' | 'mainnet'>('devnet');
    const walletNo = useRef(0);
    const Path = "m/44'/501'/";

    // Fetch SOL price on component mount
    useEffect(() => {
        fetchSolPrice();
        // Fetch price every 5 minutes to keep it updated
        const interval = setInterval(fetchSolPrice, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    function generateWallet() {
        const derivedSeed = derivePath(Path + `${walletNo.current}'`, seed).key;
        const secretkey = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = Keypair.fromSecretKey(secretkey);
        
        const newWallet: WalletData = {
            address: keypair.publicKey.toBase58(),
            privateKey: Buffer.from(keypair.secretKey).toString('hex'),
            index: walletNo.current,
            balance: undefined,
            isLoadingBalance: false
        };
        
        setKeyPairs([...keypairs, newWallet]);
        walletNo.current += 1;
    }

    const handleCopy = async (text: string, type: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            const key = `${type}-${index}`;
            setCopiedItems(prev => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setCopiedItems(prev => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const togglePrivateKey = (index: number) => {
        setShowPrivateKeys(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const deleteWallet = (index: number) => {
        setKeyPairs(prev => prev.filter(wallet => wallet.index !== index));
    };

    const fetchSolPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            if (data.solana && data.solana.usd) {
                setSolPrice(data.solana.usd);
            }
        } catch (error) {
            console.error('Error fetching SOL price:', error);
            setSolPrice(150); // Fallback to default value
        }
    };

    const fetchBalance = async (address: string, walletIndex: number) => {
        // Set loading state
        setKeyPairs(prev => prev.map(wallet => 
            wallet.index === walletIndex 
                ? { ...wallet, isLoadingBalance: true }
                : wallet
        ));

        const Network = {
            'devnet': "https://solana-devnet.g.alchemy.com/v2/",
            'mainnet': "https://solana-mainnet.g.alchemy.com/v2/"
        }
        const url = `${Network[selectedNetwork]}${config.alchemyApiKey}`;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "getBalance",
                "params": [address],
                "id": 1
            })
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (data.result && typeof data.result.value === 'number') {
                const balanceInSOL = data.result.value / 1000000000; // Convert lamports to SOL
                
                setKeyPairs(prev => prev.map(wallet => 
                    wallet.index === walletIndex 
                        ? { ...wallet, balance: balanceInSOL, isLoadingBalance: false }
                        : wallet
                ));
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            setKeyPairs(prev => prev.map(wallet => 
                wallet.index === walletIndex 
                    ? { ...wallet, balance: undefined, isLoadingBalance: false }
                    : wallet
            ));
        }
    };

    return (
        <div className="w-full">
            {/* Network Selector */}
            <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-gray-800 rounded-lg p-1 flex items-center space-x-1">
                        <button
                            onClick={() => setSelectedNetwork('devnet')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                selectedNetwork === 'devnet'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${selectedNetwork === 'devnet' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                <span>Devnet</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setSelectedNetwork('mainnet')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                selectedNetwork === 'mainnet'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${selectedNetwork === 'mainnet' ? 'bg-orange-400' : 'bg-gray-400'}`}></div>
                                <span>Mainnet</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mainnet Warning */}
                {selectedNetwork === 'mainnet' && (
                    <div className="glass rounded-xl p-4 mb-6 border-red-500/20 bg-red-500/5">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-500 mb-2">⚠️ Mainnet Warning</h3>
                                <p className="text-red-300 text-sm">
                                    <strong>DANGER:</strong> You are connected to Solana Mainnet. This is a development tool and should 
                                    <strong> NEVER be used with real funds</strong>. Do not send actual SOL or tokens to these addresses. 
                                    Use Devnet for testing purposes only.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Wallet Button */}
            <div className="text-center mb-8">
                <Button 
                    size='md' 
                    variant="primary"
                    clickHandler={generateWallet}
                    extraClass="flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Generate New Wallet</span>
                </Button>
            </div>

            {/* Wallets List */}
            <div className="space-y-6">
                {keypairs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-400">No wallets generated yet</p>
                        <p className="text-gray-500 text-sm">Click the button above to create your first wallet</p>
                    </div>
                ) : (
                    keypairs.map((wallet) => (
                        <div 
                            key={wallet.index} 
                            className="glass rounded-xl p-6 border border-gray-600 hover:border-indigo-500/50 transition-all duration-200"
                        >
                            {/* Wallet Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Wallet {wallet.index + 1}</h3>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-gray-400 text-sm">Solana Wallet</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                selectedNetwork === 'devnet' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-orange-100 text-orange-800'
                                            }`}>
                                                {selectedNetwork === 'devnet' ? '🔧 Devnet' : '🚨 Mainnet'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    clickHandler={() => deleteWallet(wallet.index)}
                                    extraClass="flex items-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                </Button>
                            </div>

                            {/* Balance Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Balance</label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        clickHandler={() => fetchBalance(wallet.address, wallet.index)}
                                        extraClass="text-xs flex items-center space-x-1"
                                        disabled={wallet.isLoadingBalance}
                                    >
                                        {wallet.isLoadingBalance ? (
                                            <>
                                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Loading...</span>
                                            </>
                                        ) : wallet.balance !== undefined ? (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span>Refresh</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>Show Balance</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <code className="text-lg font-mono text-yellow-400">
                                            {wallet.balance !== undefined 
                                                ? `${wallet.balance.toFixed(6)} SOL` 
                                                : 'Click "Show Balance" to load'
                                            }
                                        </code>
                                        {wallet.balance !== undefined && solPrice && (
                                            <span className="text-xs text-gray-400">
                                                ≈ ${(wallet.balance * solPrice).toFixed(2)} USD
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Public Address */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Public Address</label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        clickHandler={() => handleCopy(wallet.address, 'address', wallet.index)}
                                        extraClass="text-xs flex items-center space-x-1"
                                    >
                                        {copiedItems[`address-${wallet.index}`] ? (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                                    <code className="text-sm font-mono break-all text-emerald-400">
                                        {wallet.address}
                                    </code>
                                </div>
                            </div>

                            {/* Private Key */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Private Key</label>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            clickHandler={() => togglePrivateKey(wallet.index)}
                                            extraClass="text-xs flex items-center space-x-1"
                                        >
                                            {showPrivateKeys[wallet.index] ? (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 105.303 5.303m0 0L12 12m0 0l3.181 3.181M12 12l-3.181-3.181" />
                                                    </svg>
                                                    <span>Hide</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>Show</span>
                                                </>
                                            )}
                                        </Button>
                                        {showPrivateKeys[wallet.index] && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                clickHandler={() => handleCopy(wallet.privateKey, 'privatekey', wallet.index)}
                                                extraClass="text-xs flex items-center space-x-1"
                                            >
                                                {copiedItems[`privatekey-${wallet.index}`] ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                                    <code className="text-sm font-mono break-all text-red-400">
                                        {showPrivateKeys[wallet.index] ? wallet.privateKey : '•'.repeat(64)}
                                    </code>
                                </div>
                                {showPrivateKeys[wallet.index] && (
                                    <div className="mt-2 flex items-center space-x-2 text-xs text-yellow-500">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span>Never share your private key with anyone</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Section */}
            {keypairs.length > 0 && (
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-blue-400 font-semibold text-sm mb-1">Wallet Information</h4>
                            <p className="text-blue-300 text-xs">
                                These wallets are derived from your seed phrase using BIP44 derivation path: m/44&apos;/501&apos;/n&apos;. 
                                You can import these wallets into any Solana-compatible wallet using the private keys.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}