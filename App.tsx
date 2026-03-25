import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, RotateCcw, ArrowLeft, Volume2, Info, Settings, Check, X, ArrowRight } from 'lucide-react';
import { AppState, WordItem, ViewState, WordCategory } from './types';
import { VerticalText } from './components/VerticalText';

// --- MOCK DATA FOR INITIAL LOAD ---
const MOCK_WORDS: WordItem[] = [
  { id: '1', english: 'Addition', mongolian: 'ᠨᠡᠮᠡᠬᠦ ᠦᠢᠯᠡᠳᠡᠯ', example: 'Addition is basic math.' },
  { id: '2', english: 'History', mongolian: 'ᠲᠡᠦᠬᠡ', example: 'We study history.' },
  { id: '3', english: 'Nature', mongolian: 'ᠪᠠᠶᠢᠭᠠᠯᠢ', example: 'Nature is beautiful.' },
  { id: '4', english: 'Science', mongolian: 'ᠰᠢᠨᠵᠢᠯᠡᠬᠦ ᠤᠬᠠᠭᠠᠨ', example: 'Science explains the world.' },
  { id: '5', english: 'Future', mongolian: 'ᠢᠷᠡᠭᠡᠳᠦᠢ', example: 'The future is bright.' },
];

const CATEGORIES: { id: WordCategory; label: string; mongolian: string; desc: string }[] = [
    { id: 'General', label: 'General', mongolian: 'ᠶᠡᠷᠦᠩᠬᠡᠢ', desc: 'Everyday vocabulary' },
    { id: 'IELTS', label: 'IELTS', mongolian: 'ᠠᠶᠧᠯᠲᠢᠰ', desc: 'Academic & Exam prep' },
    { id: 'TOEFL', label: 'TOEFL', mongolian: 'ᠲᠣᠧ4ᠯ', desc: 'English proficiency' },
    { id: 'Business', label: 'Business', mongolian: 'ᠠᠵᠢᠯ ᠬᠡᠷᠡᠭ', desc: 'Professional context' },
    { id: 'Travel', label: 'Travel', mongolian: 'ᠠᠶᠠᠯᠠᠯ', desc: 'Tourism & Basics' },
];

// --- COMPONENTS ---

// 1. Library Selector Modal
const LibraryModal = ({ 
    isOpen, 
    onClose, 
    selectedCategory, 
    onSelect,
    onConfirm
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    selectedCategory: WordCategory; 
    onSelect: (cat: WordCategory) => void; 
    onConfirm: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" 
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto shadow-2xl transform transition-transform duration-300 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-stone-800">Word Bank</h2>
                        <span className="text-stone-400 text-sm">Choose a category to preview</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-full">
                        <X className="w-6 h-6 text-stone-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 overflow-y-auto flex-1 pb-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={`
                                relative p-4 rounded-xl border-2 flex items-center justify-between group transition-all text-left
                                ${selectedCategory === cat.id 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-stone-100 bg-white hover:border-blue-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                {/* Mongolian Vertical Text Indicator */}
                                <div className={`w-8 h-16 flex items-center justify-center rounded-lg border ${selectedCategory === cat.id ? 'bg-blue-200 border-blue-200' : 'bg-stone-50 border-stone-100'}`}>
                                     <VerticalText text={cat.mongolian} className={`text-xs h-12 ${selectedCategory === cat.id ? 'text-blue-900' : 'text-stone-400'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold ${selectedCategory === cat.id ? 'text-blue-700' : 'text-stone-700'}`}>
                                        {cat.label}
                                    </div>
                                    <div className="text-xs text-stone-400">{cat.desc}</div>
                                </div>
                            </div>
                            
                            {selectedCategory === cat.id && (
                                <div className="bg-blue-500 rounded-full p-1 shadow-sm">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={onConfirm}
                    className="mt-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-blue-200 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Start Learning {selectedCategory}</span>
                </button>
            </div>
        </div>
    );
};

// 3. Word Detail Modal
const WordDetailModal = ({ 
    isOpen, 
    onClose, 
    onNext,
    word,
    nextWord
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onNext: () => void;
    word: WordItem | null;
    nextWord: WordItem | null;
}) => {
    if (!isOpen || !word) return null;

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-white z-0"></div>
            <div className="bg-white w-full h-full z-10 overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-8 duration-500">
                <button 
                    onClick={onClose}
                    className="absolute top-8 left-8 p-3 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors z-20"
                >
                    <ArrowLeft className="w-6 h-6 text-stone-600" />
                </button>

                {/* Top 1/3: English */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 border-b border-stone-50">
                    <span className="text-stone-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">English</span>
                    <h2 className="text-6xl font-black text-stone-900 text-center leading-tight tracking-tight">{word.english}</h2>
                </div>

                {/* Middle 1/3: Mongolian */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-50/30 border-b border-stone-50">
                    <span className="text-stone-400 text-xs font-bold tracking-[0.3em] uppercase mb-6">Mongolian</span>
                    <div className="flex-1 flex items-center justify-center">
                        <VerticalText text={word.mongolian} className="text-5xl font-bold text-blue-600 h-56" />
                    </div>
                </div>

                {/* Bottom 1/3: Example */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative bg-white">
                    <div className="max-w-xs">
                        <span className="text-stone-400 text-xs font-bold tracking-[0.3em] uppercase mb-6 block">Usage Context</span>
                        <p className="text-stone-600 text-xl leading-relaxed font-medium italic">
                            "{word.example}"
                        </p>
                    </div>
                </div>

                {/* Next Word Button - Minimalist Pill - Ultra Compact */}
                <button 
                    onClick={onNext}
                    className="absolute bottom-6 right-6 px-4 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full hover:bg-blue-700 transition-all group z-30 shadow-lg shadow-blue-100"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold whitespace-nowrap">{nextWord?.english || 'Finish'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                </button>
            </div>
        </div>
    );
};

// 4. Success Modal
const SuccessModal = ({ 
    isOpen, 
    onClose 
}: { 
    isOpen: boolean; 
    onClose: () => void 
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-500" 
                onClick={onClose}
            ></div>
            
            {/* Modal Content - Horizontal Layout */}
            <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl z-10 flex flex-row items-stretch gap-6 animate-in zoom-in slide-in-from-bottom-12 duration-500">
                {/* Left: Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <div className="flex flex-row items-start gap-4 h-64">
                        {/* Column 1: You Words */}
                        <VerticalText 
                            text="ᠲᠠ ᠦᠭᠡᠰ-ᠢ" 
                            className="text-xl font-bold text-stone-800 h-full" 
                        />
                        {/* Column 2: Successfully */}
                        <VerticalText 
                            text="ᠠᠮᠵᠢᠯᠲᠠᠲᠠᠢ" 
                            className="text-xl font-bold text-stone-800 h-full" 
                        />
                        {/* Column 3: Memorized */}
                        <VerticalText 
                            text="ᠴᠡᠭᠡᠵᠢᠯᠡᠪᠡ" 
                            className="text-xl font-bold text-stone-800 h-full" 
                        />
                    </div>
                </div>

                {/* Right: Vertical Button Column */}
                <button 
                    onClick={onClose}
                    className="w-20 bg-blue-600 hover:bg-blue-700 text-white rounded-[32px] flex items-center justify-center shadow-lg shadow-blue-100 active:scale-95 transition-all group"
                >
                    {/* "Back" in Traditional Mongolian: ᠪᠣᠴᠠᠬᠤ */}
                    <VerticalText text="ᠪᠣᠴᠠᠬᠤ" className="text-white text-lg font-bold h-32 group-hover:scale-105 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// 4. Home Screen Component
const HomeView = ({ 
  state, 
  onNavigate, 
  onOpenLibrary 
}: { 
  state: AppState; 
  onNavigate: (view: ViewState) => void;
  onOpenLibrary: () => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-stone-50 p-6 relative">
      {/* Header / Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">MongolLingua</h1>
        <div className="flex gap-3">
           {/* Word Bank Icon */}
          <button 
            onClick={onOpenLibrary}
            className="group flex items-center gap-2 px-3 py-2 bg-white border-2 border-stone-200 rounded-xl shadow-sm hover:border-blue-400 transition-all active:scale-95"
            title="Word Bank"
          >
            <BookOpen className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-stone-600 hidden sm:block">{state.selectedCategory}</span>
          </button>
          
          <button 
            onClick={() => onNavigate('settings')}
            className="p-2 bg-white border-2 border-stone-200 rounded-xl shadow-sm hover:border-stone-400 transition-colors active:scale-95"
          >
            <Settings className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Main Study Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6 flex flex-row items-stretch min-h-[200px] relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        {/* Left: Info */}
        <div className="flex-1 flex flex-col justify-center z-10">
            <span className="text-stone-500 text-xs font-bold tracking-widest uppercase mb-1">{state.selectedCategory}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-stone-800">{state.learnedCount}</span>
                <span className="text-stone-400 font-medium">/ {state.dailyGoal}</span>
            </div>
            <span className="text-blue-500 text-sm font-medium mt-2">Daily Progress</span>
        </div>
        
        {/* Right: Button (Vertical Mongolian Text) */}
        <div className="w-24 ml-4 z-10">
          <button 
            onClick={() => onNavigate('study')}
            className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all shadow-blue-200 shadow-xl group"
          >
             <VerticalText text="ᠰᠤᠷᠤᠯᠴᠠᠬᠤ" className="text-white text-xl font-bold h-32 group-hover:scale-105 transition-transform" />
          </button>
        </div>
      </div>

      {/* Review Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 flex flex-row items-stretch min-h-[160px] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-full -ml-10 -mb-10 opacity-50"></div>

        <div className="flex-1 flex flex-col justify-center pl-2 z-10">
           <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-stone-800">{state.reviewCount}</span>
                <span className="text-stone-400 font-medium text-sm">/ {state.reviewTotal}</span>
           </div>
           <span className="text-orange-500 text-sm font-medium mt-1">Review Queue</span>
        </div>
        
        <div className="w-24 ml-4 z-10">
          <button 
            onClick={() => onNavigate('review')}
            className="w-full h-full bg-orange-500 rounded-2xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all shadow-orange-100 shadow-lg group"
          >
             <VerticalText text="ᠳᠠᠪᠲᠠᠬᠤ" className="text-white text-xl font-bold h-24 group-hover:scale-105 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Study Screen Component
const StudyView = ({ 
  words, 
  category,
  onBack 
}: { 
  words: WordItem[]; 
  category: string;
  onBack: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<WordItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentWord = words[currentIndex % words.length];
  const nextWord = currentIndex < words.length - 1 ? words[currentIndex + 1] : null;

  // Prepare options (1 correct + 3 random)
  useEffect(() => {
    const distractors = words
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const options = [currentWord, ...distractors].sort(() => 0.5 - Math.random());
    setShuffledOptions(options);
    setSelectedOption(null);
  }, [currentWord, words]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowDetail(false);
        setSelectedOption(null);
    } else {
        // Finished all words
        setShowSuccess(true);
    }
  };

  const handleOptionClick = (id: string) => {
    setSelectedOption(id);
    if (id === currentWord.id) {
        // Correct feedback
        setTimeout(() => {
            handleNext();
        }, 1000);
    } else {
        // Incorrect: Show detail after a short delay
        setTimeout(() => {
            setShowDetail(true);
        }, 800);
    }
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.english);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 p-4 relative">
      <WordDetailModal 
        isOpen={showDetail} 
        onClose={() => setShowDetail(false)} 
        onNext={handleNext}
        word={currentWord} 
        nextWord={nextWord}
      />

      <SuccessModal 
        isOpen={showSuccess} 
        onClose={onBack} 
      />
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 pt-2 px-2">
        <button onClick={onBack} className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{category}</span>
        <button 
            onClick={() => setShowDetail(true)}
            className="p-2 text-stone-400 hover:text-blue-500 transition-colors"
            title="Word Details"
        >
            <Info className="w-6 h-6" />
        </button>
      </div>

      {/* Target Word Section */}
      <div className="flex flex-col items-center justify-center mb-10 space-y-6">
        <div className="relative group cursor-pointer" onClick={playAudio}>
             <h2 className="text-4xl font-bold text-stone-800 tracking-wide text-center">{currentWord.english}</h2>
             <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Volume2 className="w-6 h-6 text-blue-400" />
             </div>
        </div>
        
        <button 
          onClick={playAudio}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-600 border border-blue-50 hover:bg-blue-50 active:scale-95 transition-all"
        >
          <Volume2 className="w-8 h-8 fill-current" />
        </button>
      </div>

      {/* Vertical Options Area - The core of the design */}
      <div className="flex-1 flex justify-center gap-3 px-1 min-h-[250px]">
        {shuffledOptions.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentWord.id;
            
            let statusClass = "bg-white border-stone-200 text-stone-600";
            if (isSelected) {
                statusClass = isCorrect 
                    ? "bg-green-500 border-green-600 text-white shadow-green-200" 
                    : "bg-red-400 border-red-500 text-white shadow-red-200";
            } else if (selectedOption && isCorrect) {
                // Show correct answer even if wrong one selected
                statusClass = "bg-green-100 border-green-300 text-green-800";
            }

            return (
                <button
                    key={opt.id}
                    disabled={!!selectedOption}
                    onClick={() => handleOptionClick(opt.id)}
                    className={`
                        flex-1 max-w-[85px] h-full
                        rounded-2xl border-2 shadow-sm
                        flex flex-col items-center justify-center 
                        transition-all duration-300
                        active:scale-95
                        ${statusClass}
                        ${!selectedOption && "hover:border-blue-300 hover:shadow-md hover:-translate-y-1"}
                    `}
                >
                    <VerticalText 
                        text={opt.mongolian} 
                        className="text-lg font-medium" 
                        style={{ height: '80%' }}
                    />
                </button>
            );
        })}
      </div>

      {/* Bottom Information */}
      <div className="mt-6 mb-4 px-4 flex justify-center">
        <div className="px-5 py-3 rounded-2xl bg-white border border-stone-100 shadow-sm text-stone-500 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-400" />
            <span>{currentWord.example}</span>
        </div>
      </div>
    </div>
  );
};

// 3. Settings View - Fully Refactored for Horizontal (Landscape-style) Section Scrolling
// Reduced font sizes for a more balanced UI as requested.
const SettingsView = ({ 
    dailyGoal,
    setDailyGoal,
    onBack 
}: { 
    dailyGoal: number,
    setDailyGoal: (g: number) => void,
    onBack: () => void 
}) => {
    const [inputGoal, setInputGoal] = useState(dailyGoal.toString());

    const handleSave = () => {
        const goal = parseInt(inputGoal);
        if (!isNaN(goal) && goal > 0) {
            setDailyGoal(goal);
        }
        onBack();
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-stone-50 overflow-hidden">
            {/* The Main Horizontal Scrolling Card */}
            <div className="bg-white rounded-[40px] shadow-2xl border border-stone-100 flex flex-row items-stretch gap-8 p-10 overflow-x-auto max-w-[95%] h-[75%] scrollbar-hide">
                
                {/* Section 1: Settings Label + Icon */}
                <div className="flex flex-col items-center justify-center gap-6 px-4 border-r border-stone-50 pr-8">
                   <div className="bg-stone-50 p-4 rounded-[24px] shadow-inner border border-stone-100">
                      <Settings className="w-8 h-8 text-stone-700" />
                   </div>
                   {/* "Settings" in Traditional Mongolian: ᠲᠣᠬᠢᠷᠠᠭᠤᠯᠭ᠎ᠠ - Font size reduced to text-xl */}
                   <VerticalText text="ᠲᠣᠬᠢᠷᠠᠭᠤᠯᠭ᠎ᠠ" className="text-xl font-bold text-stone-800 h-40" />
                </div>
                
                {/* Section 2: Daily Goal Vertical Label */}
                <div className="flex items-center justify-center px-4">
                    {/* "Daily Word Goal" in Traditional Mongolian: ᠡᠳᠦᠷ ᠪᠦᠷᠢ ᠶᠢᠨ ᠵᠣᠷᠢᠯᠲᠠ - Font size reduced to text-sm */}
                    <VerticalText text="ᠡᠳᠦᠷ ᠪᠦᠷᠢ ᠶᠢᠨ ᠵᠣᠷᠢᠯᠲᠠ" className="text-sm font-bold text-stone-400 h-56" />
                </div>

                {/* Section 3: Goal Input & Presets */}
                <div className="flex flex-col items-center justify-center gap-8 px-4 min-w-[240px]">
                    {/* Big Numeric Display - Font size reduced to text-4xl */}
                    <div className="relative w-full">
                        <input 
                            type="number" 
                            value={inputGoal}
                            onChange={(e) => setInputGoal(e.target.value)}
                            className="w-full h-24 bg-stone-50 border-4 border-stone-100 rounded-[32px] font-extrabold text-4xl text-center text-stone-800 focus:border-blue-100 focus:bg-white focus:outline-none transition-all shadow-inner"
                        />
                    </div>

                    {/* Preset Buttons - 10, 20, 30 as row - Font size reduced to text-lg */}
                    <div className="flex gap-3 w-full">
                        {[10, 20, 30].map(val => (
                            <button
                                key={val}
                                onClick={() => setInputGoal(val.toString())}
                                className={`flex-1 aspect-square rounded-[24px] text-lg font-extrabold border-2 transition-all ${
                                    parseInt(inputGoal) === val 
                                    ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-md scale-105' 
                                    : 'border-stone-50 bg-white text-stone-300 hover:border-stone-200'
                                }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 4: Action Buttons (Save/Cancel) */}
                <div className="flex flex-col items-center justify-center gap-8 px-8 border-l border-stone-50 pl-10">
                    {/* Save Button - Text size reduced to text-lg */}
                    <button 
                        onClick={handleSave}
                        className="w-24 h-48 bg-[#A7D9FF] text-stone-800 rounded-[32px] flex items-center justify-center hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-blue-50 group"
                    >
                        {/* "Save Changes" in Traditional Mongolian: ᠬᠠᠳᠠᠭᠠᠯᠠᠬᠤ */}
                        <VerticalText text="ᠬᠠᠳᠠᠭᠠᠯᠠᠬᠤ" className="font-bold text-lg h-36 group-hover:scale-105 transition-transform" />
                    </button>
                    
                    {/* Cancel Button - Text size reduced to text-sm */}
                    <button 
                        onClick={onBack}
                        className="flex items-center justify-center p-3 hover:bg-stone-50 rounded-2xl transition-colors group"
                    >
                        {/* "Cancel" in Traditional Mongolian: ᠪᠣᠯᠢᠬᠤ */}
                        <VerticalText text="ᠪᠣᠯᠢᠬᠤ" className="text-stone-300 group-hover:text-stone-500 font-bold text-sm h-20" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN APP ---

export default function App() {
  const [state, setState] = useState<AppState>({
    apiKey: null,
    currentView: 'home',
    words: MOCK_WORDS,
    learnedCount: 15,
    dailyGoal: 20,
    reviewCount: 0,
    reviewTotal: 5,
    selectedCategory: 'General'
  });

  const [showLibrary, setShowLibrary] = useState(false);

  const handleLibrarySelect = (cat: WordCategory) => {
      setState(prev => ({ ...prev, selectedCategory: cat }));
  };

  const handleLibraryConfirm = () => {
      setShowLibrary(false);
      setState(prev => ({ ...prev, currentView: 'study' }));
  };

  const setDailyGoal = (goal: number) => {
      setState(prev => ({ ...prev, dailyGoal: goal }));
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-stone-50 shadow-2xl overflow-hidden font-sans relative">
      <LibraryModal 
        isOpen={showLibrary} 
        onClose={() => setShowLibrary(false)}
        selectedCategory={state.selectedCategory}
        onSelect={handleLibrarySelect}
        onConfirm={handleLibraryConfirm}
      />

      {state.currentView === 'home' && (
        <HomeView 
            state={state} 
            onNavigate={(view) => setState(prev => ({ ...prev, currentView: view }))}
            onOpenLibrary={() => setShowLibrary(true)}
        />
      )}
      
      {state.currentView === 'study' && (
        <StudyView 
            words={state.words} 
            category={state.selectedCategory}
            onBack={() => setState(prev => ({ ...prev, currentView: 'home' }))} 
        />
      )}

      {state.currentView === 'review' && (
        <StudyView 
            words={[...state.words].reverse()} 
            category={`${state.selectedCategory} Review`}
            onBack={() => setState(prev => ({ ...prev, currentView: 'home' }))} 
        />
      )}

      {state.currentView === 'settings' && (
        <SettingsView 
            dailyGoal={state.dailyGoal}
            setDailyGoal={setDailyGoal}
            onBack={() => setState(prev => ({ ...prev, currentView: 'home' }))}
        />
      )}
    </div>
  );
}