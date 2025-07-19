'use client'
import { generateMnemonic } from "bip39"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Button } from "./Button"

interface SecretPhraseProps {
    setPhrase: Dispatch<SetStateAction<string>>, 
    Phrase: string
}
 
export function SecretPhrase({ setPhrase, Phrase }: SecretPhraseProps) {
    useEffect(() => {
        setPhrase(generateMnemonic(128));
    }, [setPhrase])

    const [copied, setCopied] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(Phrase);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const words = Phrase.split(' ');

    return (
        <div className="w-full">
            {/* Reveal/Hide Toggle */}
            <div className="flex justify-center mb-6">
                <Button 
                    size="sm" 
                    variant="secondary"
                    clickHandler={() => setIsRevealed(!isRevealed)}
                    extraClass="flex items-center space-x-2"
                >
                    {isRevealed ? (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 105.303 5.303m0 0L12 12m0 0l3.181 3.181M12 12l-3.181-3.181" />
                            </svg>
                            <span>Hide Phrase</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Reveal Phrase</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Mnemonic Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {words.map((word, index) => (
                    <div 
                        key={index} 
                        className="relative group"
                    >
                        <div className="glass rounded-lg p-4 text-center border border-gray-600 hover:border-indigo-500 transition-all duration-200">
                            <div className="text-xs text-gray-500 mb-1">#{index + 1}</div>
                            <div className="font-mono text-lg font-semibold">
                                {isRevealed ? word : '••••••'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                    size="md" 
                    variant="secondary"
                    clickHandler={handleCopy}
                    disabled={!isRevealed}
                    extraClass="flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy to Clipboard</span>
                </Button>

                <Button 
                    size="md" 
                    variant="ghost"
                    clickHandler={() => setPhrase(generateMnemonic(128))}
                    extraClass="flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Generate New</span>
                </Button>
            </div>

            {/* Copy Success Message */}
            {copied && (
                <div className="text-center mt-4">
                    <div className="inline-flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Seed phrase copied to clipboard!</span>
                    </div>
                </div>
            )}

            {/* Security Reminder */}
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                        <h4 className="text-red-400 font-semibold text-sm mb-1">Keep Your Seed Phrase Safe</h4>
                        <p className="text-red-300 text-xs">
                            Anyone with access to your seed phrase can control your wallets. 
                            Never share it online or store it digitally. Write it down and keep it secure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}