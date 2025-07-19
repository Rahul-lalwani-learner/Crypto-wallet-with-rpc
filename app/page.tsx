"use client"
import { useState } from "react";
import { Button } from "./components/Button";
import { SecretPhrase } from "./components/SecretPhrase";
import { Wallets } from "./components/Wallets";
import { mnemonicToSeedSync } from "bip39";

export default function Home() {
  const [loadSecretPhrase, setLoadSecretPhrase] = useState(false);
  const [secretPhrase, setSecretPhrase] = useState("");
  const [step, setStep] = useState<'start' | 'phrase' | 'wallets'>('start');
  const [existingSeedPhrase, setExistingSeedPhrase] = useState("");

  const handleGenerate = () => {
    setLoadSecretPhrase(true);
    setStep('phrase');
  };

  const handleUseExistingSeed = () => {
    if (existingSeedPhrase.trim()) {
      setSecretPhrase(existingSeedPhrase.trim());
      setLoadSecretPhrase(true);
      setStep('wallets');
    }
  };

  const handleContinueToWallets = () => {
    setStep('wallets');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold gradient-text">CryptoVault</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate secure Solana wallets with industry-standard mnemonic seed phrases. 
            Your keys, your crypto, your control.
          </p>
        </div>

        {/* Security Notice */}
        <div className="glass rounded-2xl p-6 mb-8 border-yellow-500/20">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Security Warning</h3>
              <p className="text-gray-300 text-sm">
                This is a development tool. Never use generated wallets for real funds. 
                Always verify the security of any wallet before storing valuable assets.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass rounded-2xl p-8 shadow-glow">
          {step === 'start' && (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">Generate Your Secure Wallet</h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                  Create a new mnemonic seed phrase to generate multiple Solana wallets
                </p>
              </div>

              {/* Existing Seed Phrase Input */}
              <div className="mb-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-200">
                  Or use your existing seed phrase
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={existingSeedPhrase}
                    onChange={(e) => setExistingSeedPhrase(e.target.value)}
                    placeholder="Enter your 12-word seed phrase separated by spaces..."
                    className="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none h-24 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <Button 
                    clickHandler={handleUseExistingSeed}
                    size="md" 
                    variant="secondary"
                    disabled={!existingSeedPhrase.trim()}
                    extraClass="w-full"
                  >
                    Use Existing Seed Phrase
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center my-8 max-w-md mx-auto">
                <div className="flex-1 border-t border-gray-600"></div>
                <span className="px-4 text-gray-400 text-sm">OR</span>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>

              <Button 
                clickHandler={handleGenerate} 
                size="lg" 
                variant="primary"
                extraClass="shadow-glow"
              >
                Generate New Seed Phrase
              </Button>
            </div>
          )}          {step === 'phrase' && loadSecretPhrase && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Your Secret Recovery Phrase</h2>
                <p className="text-gray-400">
                  Write down these 12 words in the exact order shown. Keep them safe and never share them.
                </p>
              </div>
              <SecretPhrase setPhrase={setSecretPhrase} Phrase={secretPhrase} />
              <div className="text-center mt-8">
                <Button 
                  clickHandler={handleContinueToWallets} 
                  size="md" 
                  variant="primary"
                  disabled={!secretPhrase}
                >
                  Continue to Wallets
                </Button>
              </div>
            </div>
          )}

          {step === 'wallets' && loadSecretPhrase && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Your Solana Wallets</h2>
                <p className="text-gray-400">
                  Generate multiple wallets from your seed phrase using BIP44 derivation
                </p>
              </div>
              <Wallets seed={mnemonicToSeedSync(secretPhrase).toString('hex')} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Built with Next.js, Tailwind CSS, and Solana Web3.js
          </p>
        </div>
      </div>
    </div>
  )
}
