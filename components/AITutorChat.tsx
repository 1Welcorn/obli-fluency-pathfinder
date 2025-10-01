import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AITutorChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AITutorChat: React.FC<AITutorChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'pt' | 'en' | null>(null);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [isGenderSwitching, setIsGenderSwitching] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = window.speechSynthesis;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Language detection function
  const detectLanguage = (text: string): 'pt' | 'en' => {
    // Enhanced language detection based on Portuguese words, characters, and patterns
    const portugueseIndicators = [
      // Portuguese-specific characters
      'ã', 'õ', 'ç', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô', 'à', 'è', 'ì', 'ò', 'ù',
      // Common Portuguese words
      'que', 'para', 'com', 'uma', 'uma', 'dos', 'das', 'não', 'sim', 'está', 'são',
      'obrigado', 'obrigada', 'por favor', 'desculpe', 'olá', 'tchau', 'bom dia',
      'boa tarde', 'boa noite', 'você', 'nós', 'eles', 'elas', 'meu', 'minha', 'seu', 'sua',
      'muito', 'bem', 'também', 'aqui', 'ali', 'onde', 'quando', 'como', 'porque',
      'então', 'mas', 'porém', 'contudo', 'todavia', 'assim', 'dessa', 'desse',
      'fluência', 'inglês', 'português', 'aprender', 'estudar', 'praticar', 'concurso',
      'obli', 'professor', 'aluno', 'estudante', 'escola', 'universidade'
    ];
    
    const englishIndicators = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'a', 'an',
      'fluency', 'english', 'portuguese', 'learn', 'study', 'practice', 'contest',
      'teacher', 'student', 'school', 'university', 'hello', 'hi', 'goodbye',
      'thank you', 'please', 'sorry', 'excuse me', 'how are you', 'what is'
    ];
    
    const textLower = text.toLowerCase();
    const portugueseCount = portugueseIndicators.filter(indicator => 
      textLower.includes(indicator)
    ).length;
    const englishCount = englishIndicators.filter(indicator => 
      textLower.includes(indicator)
    ).length;
    
    // If we find more Portuguese indicators than English, it's Portuguese
    return portugueseCount > englishCount ? 'pt' : 'en';
  };

  // Format message text with markdown-like formatting
  const formatMessageText = (text: string): string => {
    // First, escape all HTML to prevent XSS
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    // Apply markdown formatting
    formatted = formatted
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text: *text* -> <em>text</em> (simple approach)
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      // Code text: `text` -> <code>text</code>
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="font-bold text-base mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="font-bold text-lg mt-3 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="font-bold text-xl mt-4 mb-3">$1</h1>')
      // Lists
      .replace(/^[-*] (.+)$/gm, '<li class="ml-4">• $1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return formatted;
  };

  // Add natural pauses and improve speech flow
  const addNaturalPauses = (text: string): string => {
    return text
      // Add pauses after sentences
      .replace(/\.\s+/g, '. ')
      .replace(/!\s+/g, '! ')
      .replace(/\?\s+/g, '? ')
      // Add pauses after commas
      .replace(/,\s+/g, ', ')
      // Add pauses after colons and semicolons
      .replace(/:\s+/g, ': ')
      .replace(/;\s+/g, '; ')
      // Add pauses for better flow
      .replace(/\s+and\s+/g, ' and ')
      .replace(/\s+or\s+/g, ' or ')
      .replace(/\s+but\s+/g, ' but ')
      .replace(/\s+so\s+/g, ' so ')
      .replace(/\s+then\s+/g, ' then ')
      // Portuguese equivalents
      .replace(/\s+e\s+/g, ' e ')
      .replace(/\s+ou\s+/g, ' ou ')
      .replace(/\s+mas\s+/g, ' mas ')
      .replace(/\s+então\s+/g, ' então ')
      .replace(/\s+assim\s+/g, ' assim ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Clean text for speech synthesis
  const cleanTextForSpeech = (text: string): string => {
    return addNaturalPauses(text
      // Remove emojis and special characters
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and pictographs
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      // Remove common AI response patterns
      .replace(/^🏆\s*\*?\*?Faltam\s+\d+\s+dias\s+para\s+a\s+OBLI\s+2025\.2!\*?\*?\s*🏆/gi, '')
      .replace(/^Olá!\s*Eu\s+sou\s+seu\s+OBLI\s+2025\s+Fluency\s+Coach!/gi, 'Olá! Eu sou seu OBLI 2025 Fluency Coach!')
      .replace(/^Hello!\s*I'm\s+your\s+OBLI\s+2025\s+Fluency\s+Coach!/gi, 'Hello! I am your OBLI 2025 Fluency Coach!')
      // Remove excessive punctuation
      .replace(/[!]{2,}/g, '!') // Multiple exclamation marks
      .replace(/[?]{2,}/g, '?') // Multiple question marks
      .replace(/[.]{2,}/g, '.') // Multiple periods
      .replace(/[~]{2,}/g, '') // Multiple tildes
      .replace(/[_]{2,}/g, '') // Multiple underscores
      // Remove special characters that shouldn't be spoken
      .replace(/[🏆🎯💬📊👨‍🏫📈📚🎨☁️🔧🎤🌍🇧🇷🇺🇸🤖✨🎉🚀📱🎓]/g, '')
      // Remove common symbols
      .replace(/[•·▪▫]/g, '') // Bullet points
      .replace(/[→←↑↓]/g, '') // Arrows
      .replace(/[★☆]/g, '') // Stars
      .replace(/[✓✔]/g, '') // Checkmarks
      .replace(/[✗✘]/g, '') // X marks
      // Clean up extra spaces and line breaks
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
    );
  };

  // Text-to-Speech function with language detection
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !speechSynthesis) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) return; // Don't speak if nothing left after cleaning

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const language = detectLanguage(cleanedText);
    setCurrentLanguage(language);
    
    // Configure voice settings based on language for more natural speech
    if (language === 'pt') {
      // Portuguese settings - natural Brazilian Portuguese
      utterance.rate = 1.1; // Slightly faster for natural flow
      utterance.pitch = 0.95; // Slightly lower pitch for warmth
      utterance.volume = 0.9; // Higher volume for clarity
      utterance.lang = 'pt-BR'; // Brazilian Portuguese
    } else {
      // English settings - natural American English
      utterance.rate = 0.95; // Slightly slower for clarity but natural
      utterance.pitch = 1.05; // Slightly higher pitch for friendliness
      utterance.volume = 0.9; // Higher volume for clarity
      utterance.lang = 'en-US'; // US English
    }

    // Get voices and select the most natural-sounding one
    const voices = speechSynthesis.getVoices();
    let selectedVoice = null;

          if (language === 'pt') {
            // Portuguese voice selection based on gender preference
            if (voiceGender === 'female') {
              selectedVoice = voices.find(voice => 
                voice.lang === 'pt-BR' && (
                  voice.name.includes('Luciana') || 
                  voice.name.includes('Female') ||
                  voice.name.includes('Google')
                )
              ) || voices.find(voice => 
                voice.lang === 'pt-BR' && !voice.name.includes('Male')
              ) || voices.find(voice => 
                voice.lang === 'pt-BR'
              ) || voices.find(voice => 
                voice.lang.startsWith('pt') && !voice.name.includes('Male')
              );
            } else {
              // Male Portuguese voices
              selectedVoice = voices.find(voice => 
                voice.lang === 'pt-BR' && (
                  voice.name.includes('Daniel') || 
                  voice.name.includes('Male') ||
                  voice.name.includes('Google')
                )
              ) || voices.find(voice => 
                voice.lang === 'pt-BR' && voice.name.includes('Male')
              ) || voices.find(voice => 
                voice.lang.startsWith('pt') && voice.name.includes('Male')
              ) || voices.find(voice => 
                voice.lang === 'pt-BR'
              );
            }
          } else {
            // English voice selection based on gender preference
            if (voiceGender === 'female') {
              selectedVoice = voices.find(voice => 
                voice.lang.startsWith('en') && (
                  voice.name.includes('Samantha') || 
                  voice.name.includes('Karen') || 
                  voice.name.includes('Susan') ||
                  voice.name.includes('Victoria') ||
                  voice.name.includes('Female') ||
                  voice.name.includes('Google')
                )
              ) || voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.includes('Female')
              ) || voices.find(voice => 
                voice.lang.startsWith('en') && !voice.name.includes('Male')
              ) || voices.find(voice => 
                voice.lang.startsWith('en')
              );
            } else {
              // Male English voices
              selectedVoice = voices.find(voice => 
                voice.lang.startsWith('en') && (
                  voice.name.includes('Alex') || 
                  voice.name.includes('Tom') || 
                  voice.name.includes('David') ||
                  voice.name.includes('Male') ||
                  voice.name.includes('Google')
                )
              ) || voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.includes('Male')
              ) || voices.find(voice => 
                voice.lang.startsWith('en') && !voice.name.includes('Female')
              ) || voices.find(voice => 
                voice.lang.startsWith('en')
              );
            }
          }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
      console.log(`No specific voice found, using default for ${language}`);
    }

    // Add event listeners for better control
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('Speech started');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentLanguage(null);
      console.log('Speech ended');
    };
    
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setCurrentLanguage(null);
      console.error('Speech error:', event.error);
    };

    // Add a small delay to ensure voices are loaded
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 100);
  };

  // Stop speaking function
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Gender switching function with animation
  const switchGender = (newGender: 'male' | 'female') => {
    if (newGender === voiceGender) return;
    
    setIsGenderSwitching(true);
    stopSpeaking(); // Stop any current speech when switching
    
    setTimeout(() => {
      setVoiceGender(newGender);
      setIsGenderSwitching(false);
    }, 300); // Half of the animation duration
  };

  // Avatar component for different genders
  const AvatarComponent = ({ gender, isSpeaking, isLoading }: { gender: 'male' | 'female', isSpeaking: boolean, isLoading: boolean }) => {
    if (gender === 'male') {
      return (
        <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl float-animation animate-breathe relative overflow-hidden ${isGenderSwitching ? 'animate-gender-switch' : ''}`}>
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full animate-pulse opacity-75"></div>
          
          {/* Male Avatar face */}
          <div className="relative z-10 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {/* Eyes */}
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-blink"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-blink" style={{animationDelay: '0.1s'}}></div>
            </div>
            
            {/* Mustache for male */}
            <div className="absolute bottom-6 w-8 h-1 bg-white rounded-full"></div>
            
            {/* Mouth */}
            <div className="absolute bottom-4 w-6 h-3 border-b-2 border-white rounded-full animate-smile"></div>
          </div>
          
          {/* Speaking indicator rings */}
          <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          
          {/* Speaking animation when AI is responding */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/10 rounded-full animate-speak"></div>
          )}
        </div>
      );
    } else {
      return (
        <div className={`w-32 h-32 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl float-animation animate-breathe relative overflow-hidden ${isGenderSwitching ? 'animate-gender-switch' : ''}`}>
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-full animate-pulse opacity-75"></div>
          
          {/* Female Avatar face */}
          <div className="relative z-10 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {/* Eyes */}
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-blink"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-blink" style={{animationDelay: '0.1s'}}></div>
            </div>
            
            {/* Eyelashes for female */}
            <div className="absolute top-8 left-2 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full"></div>
            
            {/* Mouth */}
            <div className="absolute bottom-4 w-6 h-3 border-b-2 border-white rounded-full animate-smile"></div>
          </div>
          
          {/* Speaking indicator rings */}
          <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          
          {/* Speaking animation when AI is responding */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/10 rounded-full animate-speak"></div>
          )}
        </div>
      );
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/ask-ai' 
        : 'http://localhost:3000/ask-ai';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Automatically speak AI response
      setTimeout(() => {
        speakText(data.response);
      }, 500); // Small delay to let the message appear first
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao conectar com a IA. Verifique se o servidor está rodando.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                OBLI 2025 AI Coach
              </h2>
              <p className="text-white/80 text-sm font-medium">Your personal English fluency mentor</p>
            </div>
            
                   {/* Voice Controls */}
                   <div className="flex items-center space-x-2">
                     {/* Voice Gender Selection */}
                     <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                       <button
                         onClick={() => switchGender('female')}
                         disabled={isGenderSwitching}
                         className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                           voiceGender === 'female' 
                             ? 'bg-white/20 text-white' 
                             : 'text-white/70 hover:text-white hover:bg-white/10'
                         } ${isGenderSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                         title="Female voice"
                       >
                         👩 Female
                       </button>
                       <button
                         onClick={() => switchGender('male')}
                         disabled={isGenderSwitching}
                         className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                           voiceGender === 'male' 
                             ? 'bg-white/20 text-white' 
                             : 'text-white/70 hover:text-white hover:bg-white/10'
                         } ${isGenderSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                         title="Male voice"
                       >
                         👨 Male
                       </button>
                     </div>
                     
                     {/* Language Indicator */}
                     {isSpeaking && currentLanguage && (
                       <div className="px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                         <span className="text-xs font-medium text-white">
                           {currentLanguage === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
                         </span>
                       </div>
                     )}
                     
                     {/* Voice Quality Indicator */}
                     {isVoiceEnabled && (
                       <div className="px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                         <span className="text-xs text-white/80">
                           {isSpeaking ? '🎤 Speaking' : '🔊 Ready'}
                         </span>
                       </div>
                     )}
                     
                     {/* Voice Toggle */}
                     <button
                       onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                       className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${
                         isVoiceEnabled 
                           ? 'bg-white/20 hover:bg-white/30' 
                           : 'bg-white/10 hover:bg-white/20'
                       } ${isSpeaking ? 'voice-pulse' : ''}`}
                       title={isVoiceEnabled ? 'Voice enabled' : 'Voice disabled'}
                     >
                       <svg className={`w-5 h-5 ${isVoiceEnabled ? 'text-white' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                       </svg>
                     </button>
                     
                     {/* Stop Speaking */}
                     {isSpeaking && (
                       <button
                         onClick={stopSpeaking}
                         className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                         title="Stop speaking"
                       >
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                         </svg>
                       </button>
                     )}
                   </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm group"
          >
            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Window */}
        <div 
          ref={chatWindowRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white"
        >
                 {messages.length === 0 && (
                   <div className="text-center mt-12 animate-fade-in">
                     <div className="relative mx-auto mb-6 w-32 h-32">
                       {/* AI Avatar Container with Gender Selection */}
                       <AvatarComponent 
                         gender={voiceGender} 
                         isSpeaking={isSpeaking} 
                         isLoading={isLoading} 
                       />
                       
                       {/* Floating particles around avatar */}
                       <div className="absolute -top-2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-float-particle"></div>
                       <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float-particle" style={{animationDelay: '1s'}}></div>
                       <div className="absolute -bottom-2 -right-1 w-1 h-1 bg-indigo-400 rounded-full animate-float-particle" style={{animationDelay: '2s'}}></div>
                       <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float-particle" style={{animationDelay: '0.5s'}}></div>
                     </div>
                     
                     <h3 className="text-2xl font-bold text-gray-800 mb-2">
                       Welcome to OBLI 2025 AI Coach!
                     </h3>
                     <p className="text-gray-600 text-lg mb-4">
                       Your personal {voiceGender === 'male' ? 'male' : 'female'} English fluency mentor is ready to help you prepare for the contest.
                     </p>
                     <div className="flex flex-wrap justify-center gap-2">
                       <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">🏆 Contest Preparation</span>
                       <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">💬 Real-time Practice</span>
                       <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">🎯 Personalized Feedback</span>
                       <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                         {voiceGender === 'male' ? '👨 Male Voice' : '👩 Female Voice'}
                       </span>
                     </div>
                   </div>
                 )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} message-slide-in`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative">
                  {message.isUser ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* AI Avatar with gender-based styling */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${
                        voiceGender === 'male' 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-br from-pink-500 to-purple-600'
                      }`}>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-blink"></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-blink" style={{animationDelay: '0.1s'}}></div>
                        </div>
                        {/* Gender indicator */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-xs">
                          {voiceGender === 'male' ? '👨' : '👩'}
                        </div>
                      </div>
                      {/* Speaking indicator for AI */}
                      {isLoading && message.id === messages[messages.length - 1]?.id && (
                        <div className="absolute -inset-1 border border-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Message Bubble */}
                <div
                  className={`px-5 py-3 rounded-3xl shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div 
                    className="message-content text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageText(message.text) 
                    }}
                  />
                  <div className={`flex items-center justify-between mt-2 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    <p className="text-xs">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {!message.isUser && isVoiceEnabled && (
                      <button
                        onClick={() => speakText(message.text)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        title="Speak this message"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
                 {isLoading && (
                   <div className="flex justify-start">
                     <div className="flex items-start space-x-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                         voiceGender === 'male' 
                           ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                           : 'bg-gradient-to-br from-pink-500 to-purple-600'
                       }`}>
                         {/* Animated AI Avatar */}
                         <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                           <div className="flex space-x-1">
                             <div className="w-1 h-1 bg-white rounded-full animate-blink"></div>
                             <div className="w-1 h-1 bg-white rounded-full animate-blink" style={{animationDelay: '0.1s'}}></div>
                           </div>
                         </div>
                         {/* Gender indicator */}
                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-xs">
                           {voiceGender === 'male' ? '👨' : '👩'}
                         </div>
                         {/* Speaking indicator rings */}
                         <div className="absolute -inset-1 border border-white/30 rounded-full animate-ping"></div>
                         <div className="absolute -inset-1 border border-white/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                       </div>
                <div className="bg-white border border-gray-200 px-5 py-3 rounded-3xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {isSpeaking 
                        ? `AI Coach is speaking ${currentLanguage === 'pt' ? 'Portuguese' : 'English'}...` 
                        : 'AI Coach is thinking...'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-t border-gray-100">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message in English..."
                className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Sending</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                <span>to send</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift</kbd>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                <span>for new line</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-600">
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
              <span className="font-medium">AI Coach Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorChat;
