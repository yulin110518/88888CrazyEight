import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Diamond, 
  Club, 
  Spade, 
  RotateCcw, 
  Trophy, 
  User, 
  Cpu,
  Info,
  ChevronRight
} from 'lucide-react';

// --- Types & Constants ---

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_ICONS = {
  hearts: <Heart className="w-full h-full text-rose-500 fill-rose-500" />,
  diamonds: <Diamond className="w-full h-full text-amber-500 fill-amber-500" />,
  clubs: <Club className="w-full h-full text-emerald-600 fill-emerald-600" />,
  spades: <Spade className="w-full h-full text-sky-700 fill-sky-700" />,
};

const SUIT_COLORS = {
  hearts: 'text-rose-600',
  diamonds: 'text-amber-600',
  clubs: 'text-emerald-700',
  spades: 'text-sky-800',
};

// --- Helper Functions ---

const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({ id: `${rank}-${suit}`, suit, rank });
    });
  });
  return deck;
};

const shuffle = (deck: CardData[]): CardData[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// --- Components ---

const Card = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false, 
  isSmall = false,
  className = ""
}: { 
  card?: CardData; 
  isFaceUp?: boolean; 
  onClick?: () => void; 
  isPlayable?: boolean;
  isSmall?: boolean;
  className?: string;
  key?: React.Key;
}) => {
  const cardContent = isFaceUp && card ? (
    <div className={`relative w-full h-full bg-[#fdfaf1] rounded-lg border-2 ${isPlayable ? 'border-amber-500 shadow-lg shadow-amber-500/50 scale-105' : 'border-stone-300'} flex flex-col p-1 sm:p-2 select-none overflow-hidden`}>
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
      
      <div className={`flex flex-col items-center self-start ${SUIT_COLORS[card.suit]} z-10`}>
        <span className="text-xs sm:text-sm font-serif-sc font-bold leading-none">{card.rank}</span>
        <div className="w-2 h-2 sm:w-3 sm:h-3">{SUIT_ICONS[card.suit]}</div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-10 p-4">
        {SUIT_ICONS[card.suit]}
      </div>

      <div className={`flex flex-col items-center self-end rotate-180 ${SUIT_COLORS[card.suit]} z-10`}>
        <span className="text-xs sm:text-sm font-serif-sc font-bold leading-none">{card.rank}</span>
        <div className="w-2 h-2 sm:w-3 sm:h-3">{SUIT_ICONS[card.suit]}</div>
      </div>
    </div>
  ) : (
    <div className="w-full h-full bg-[#1a1a1a] rounded-lg border-2 border-amber-600/50 flex items-center justify-center p-1 sm:p-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[url('https://picsum.photos/id/1016/400/600?grayscale')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/40 to-transparent"></div>
      <div className="w-full h-full border border-amber-500/30 rounded flex items-center justify-center z-10">
        <div className="flex flex-col items-center text-amber-500/60">
          <div className="font-calligraphy text-3xl sm:text-5xl drop-shadow-lg">泰山</div>
          <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] font-serif-sc mt-1">Mount Tai</div>
        </div>
      </div>
      {/* Decorative corners */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-500/40"></div>
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-500/40"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-500/40"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-500/40"></div>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        ${isSmall ? 'w-12 h-16 sm:w-16 sm:h-24' : 'w-16 h-24 sm:w-24 sm:h-36'} 
        cursor-pointer relative transition-shadow
        ${className}
      `}
    >
      {cardContent}
    </motion.div>
  );
};

export default function App() {
  const [deck, setDeck] = useState<CardData[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [aiHand, setAiHand] = useState<CardData[]>([]);
  const [discardPile, setDiscardPile] = useState<CardData[]>([]);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [activeSuit, setActiveSuit] = useState<Suit | null>(null);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'player_won' | 'ai_won'>('idle');
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [message, setMessage] = useState("Welcome to Tina's Crazy Eights!");

  const topDiscard = discardPile[discardPile.length - 1];

  // --- Game Logic ---

  const initGame = useCallback(() => {
    const fullDeck = shuffle(createDeck());
    const pHand = fullDeck.splice(0, 8);
    const aHand = fullDeck.splice(0, 8);
    
    // Ensure first discard is not an 8 for simplicity in first turn
    let firstDiscardIndex = 0;
    while(fullDeck[firstDiscardIndex].rank === '8') {
      firstDiscardIndex++;
    }
    const firstDiscard = fullDeck.splice(firstDiscardIndex, 1)[0];

    setDeck(fullDeck);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setDiscardPile([firstDiscard]);
    setActiveSuit(null);
    setTurn('player');
    setGameStatus('playing');
    setMessage("Your turn! Match the suit or rank.");
  }, []);

  const isPlayable = useCallback((card: CardData) => {
    if (!topDiscard) return false;
    if (card.rank === '8') return true;
    
    const targetSuit = activeSuit || topDiscard.suit;
    return card.suit === targetSuit || card.rank === topDiscard.rank;
  }, [topDiscard, activeSuit]);

  const handlePlayCard = useCallback((card: CardData, isPlayer: boolean) => {
    if (isPlayer) {
      setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    } else {
      setAiHand(prev => prev.filter(c => c.id !== card.id));
    }

    setDiscardPile(prev => [...prev, card]);
    
    if (card.rank === '8') {
      if (isPlayer) {
        setShowSuitSelector(true);
        setMessage("Choose a new suit!");
      } else {
        // AI chooses suit (simple: most frequent suit in hand)
        const suitsInHand = aiHand.filter(c => c.id !== card.id).map(c => c.suit);
        const mostFrequentSuit = SUITS.reduce((a, b) => 
          suitsInHand.filter(s => s === a).length >= suitsInHand.filter(s => s === b).length ? a : b
        );
        setActiveSuit(mostFrequentSuit);
        setMessage(`AI played an 8 and chose ${mostFrequentSuit}!`);
        setTurn('player');
      }
    } else {
      setActiveSuit(null);
      setTurn(isPlayer ? 'ai' : 'player');
      setMessage(isPlayer ? "AI is thinking..." : "Your turn!");
    }
  }, [aiHand]);

  const handleDrawCard = useCallback((isPlayer: boolean) => {
    if (deck.length === 0) {
      setMessage("Deck is empty! Skipping turn.");
      setTurn(isPlayer ? 'ai' : 'player');
      return;
    }

    const newCard = deck[0];
    setDeck(prev => prev.slice(1));

    if (isPlayer) {
      setPlayerHand(prev => [...prev, newCard]);
      setMessage("You drew a card.");
    } else {
      setAiHand(prev => [...prev, newCard]);
      setMessage("AI drew a card.");
      setTurn('player');
    }
  }, [deck]);

  const handleSuitSelect = (suit: Suit) => {
    setActiveSuit(suit);
    setShowSuitSelector(false);
    setTurn('ai');
    setMessage(`You chose ${suit}. AI is thinking...`);
  };

  // --- AI Logic ---

  useEffect(() => {
    if (turn === 'ai' && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const playableCards = aiHand.filter(isPlayable);
        
        if (playableCards.length > 0) {
          const nonEight = playableCards.find(c => c.rank !== '8');
          const cardToPlay = nonEight || playableCards[0];
          handlePlayCard(cardToPlay, false);
        } else {
          handleDrawCard(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, isPlayable, handlePlayCard, handleDrawCard, gameStatus]);

  // --- Win Condition ---

  useEffect(() => {
    if (gameStatus === 'playing') {
      if (playerHand.length === 0) {
        setGameStatus('player_won');
        setMessage("Congratulations! You won!");
      } else if (aiHand.length === 0) {
        setGameStatus('ai_won');
        setMessage("AI won! Better luck next time.");
      }
    }
  }, [playerHand, aiHand, gameStatus]);

  // --- Render Helpers ---

  const renderSuitIcon = (suit: Suit) => {
    switch(suit) {
      case 'hearts': return <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />;
      case 'diamonds': return <Diamond className="w-6 h-6 text-amber-500 fill-amber-500" />;
      case 'clubs': return <Club className="w-6 h-6 text-emerald-600 fill-emerald-600" />;
      case 'spades': return <Spade className="w-6 h-6 text-sky-700 fill-sky-700" />;
    }
  };

  return (
    <div className="min-h-screen fengshui-bg text-stone-100 font-serif-sc selection:bg-amber-900/50 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 bg-black/40 backdrop-blur-md flex justify-between items-center border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-calligraphy text-2xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            八
          </div>
          <h1 className="text-xl font-bold tracking-widest font-calligraphy text-amber-100 hidden sm:block">泰山风水 · 疯狂八点</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-amber-500/20">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">{aiHand.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-amber-500/20">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">{playerHand.length}</span>
          </div>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-amber-400"
            title="重新开始"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative p-4 flex flex-col items-center justify-between max-w-6xl mx-auto w-full">
        
        {/* AI Hand */}
        <div className="w-full flex justify-center h-24 sm:h-36">
          <div className="flex -space-x-8 sm:-space-x-12">
            {aiHand.map((card, idx) => (
              <Card key={card.id} isFaceUp={false} isSmall className="z-0" />
            ))}
          </div>
        </div>

        {/* Center Table */}
        <div className="flex flex-col items-center gap-8 my-4">
          <div className="flex items-center gap-8 sm:gap-16">
            {/* Draw Pile */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/5 rounded-xl blur-sm group-hover:bg-white/10 transition-all"></div>
              <div 
                className={`relative ${deck.length > 0 ? 'cursor-pointer' : 'opacity-50'}`}
                onClick={() => turn === 'player' && gameStatus === 'playing' && handleDrawCard(true)}
              >
                <Card isFaceUp={false} />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-emerald-300 uppercase tracking-widest">
                  Deck ({deck.length})
                </div>
              </div>
            </div>

            {/* Discard Pile */}
            <div className="relative">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={topDiscard?.id}
                  initial={{ x: 100, opacity: 0, rotate: 45 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Card card={topDiscard} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-emerald-300 uppercase tracking-widest whitespace-nowrap">
                Discard
              </div>
              
              {activeSuit && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-yellow-400 z-10"
                >
                  {renderSuitIcon(activeSuit)}
                </motion.div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full border border-amber-500/30 flex items-center gap-3 shadow-2xl">
            <div className={`w-2 h-2 rounded-full ${turn === 'player' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-stone-600'}`} />
            <p className="text-sm sm:text-base font-medium text-amber-50 tracking-wide">{message}</p>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl">
            <AnimatePresence>
              {playerHand.map((card) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  isPlayable={turn === 'player' && gameStatus === 'playing' && isPlayable(card)}
                  onClick={() => handlePlayCard(card, true)}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {/* Controls Hint */}
          {turn === 'player' && gameStatus === 'playing' && playerHand.filter(isPlayable).length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-yellow-400 text-xs font-bold uppercase tracking-tighter flex items-center gap-1"
            >
              <Info className="w-3 h-3" /> No playable cards! Draw from the deck.
            </motion.div>
          )}
        </div>
      </main>

      {/* Suit Selector Modal */}
      <AnimatePresence>
        {showSuitSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-emerald-800 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Wild 8!</h2>
              <p className="text-emerald-200 mb-8">Choose the next suit to play</p>
              
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map((suit) => (
                  <button
                    key={suit}
                    onClick={() => handleSuitSelect(suit)}
                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
                  >
                    <div className="w-12 h-12 group-hover:scale-110 transition-transform">
                      {SUIT_ICONS[suit]}
                    </div>
                    <span className="capitalize font-medium text-sm">{suit}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameStatus !== 'playing' && gameStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex p-6 bg-yellow-500 rounded-full shadow-2xl shadow-yellow-500/20">
                <Trophy className="w-16 h-16 text-black" />
              </div>
              
              <h2 className="text-5xl font-black mb-2 tracking-tighter uppercase">
                {gameStatus === 'player_won' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-emerald-300 text-xl mb-12">
                {gameStatus === 'player_won' 
                  ? 'You cleared your hand like a pro.' 
                  : 'The AI was too fast this time.'}
              </p>
              
              <button
                onClick={initGame}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all mx-auto"
              >
                Play Again
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      <AnimatePresence>
        {gameStatus === 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] p-4"
          >
            {/* Background Image for Start Screen - Traditional Painting Style */}
            <div className="absolute inset-0 opacity-60 bg-[url('https://picsum.photos/id/1015/1920/1080?grayscale')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
            <div className="absolute inset-0 bg-[#3d2b1f]/20 mix-blend-sepia"></div>

            <div className="max-w-md w-full text-center relative z-10">
              <motion.div 
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-12"
              >
                <div className="font-calligraphy text-amber-500 text-3xl mb-4 tracking-[0.8em] opacity-80">泰山石敢当</div>
                <h1 className="text-8xl font-black tracking-tighter uppercase text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center">
                  <span className="text-2xl font-serif-sc tracking-[1em] mb-2 opacity-60">FENG SHUI</span>
                  <div className="flex items-center gap-4">
                    <span className="font-calligraphy">泰山</span>
                    <span className="text-amber-500 font-calligraphy">八点</span>
                  </div>
                </h1>
                <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-6"></div>
              </motion.div>
              
              <div className="space-y-6 mb-16 text-stone-200 text-xl font-serif-sc leading-relaxed">
                <p className="tracking-[0.3em] drop-shadow-md">五行轮转 · 顺天应时</p>
                <p className="tracking-[0.2em] text-amber-400/90 italic">“八”为乾坤之变，可定风水之局。</p>
                <p className="tracking-[0.3em] opacity-80">登泰山而小天下，清残牌而定胜负。</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(217,119,6,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={initGame}
                className="w-full bg-gradient-to-b from-amber-600 to-amber-800 text-white py-5 rounded-lg font-bold text-2xl hover:from-amber-500 hover:to-amber-700 transition-all shadow-2xl border border-amber-400/40 tracking-[0.5em] font-calligraphy"
              >
                开启征程
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Info */}
      <footer className="p-4 text-center text-emerald-500/50 text-[10px] uppercase tracking-[0.2em] font-mono">
        Built with React & Tailwind • Tina's Crazy Eights v1.0
      </footer>
    </div>
  );
}
