import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, RotateCcw, ArrowLeft, Volume2, Info, Settings, Loader2, Check, X } from 'lucide-react';
import { AppState, WordItem, ViewState, WordCategory } from './types';
// 临时禁用 GeminiService
// import { GeminiService } from './services/geminiService';
import { VerticalText } from './components/VerticalText';
import { getUserId } from './utils/userIdUtils';
import './utils/fetchInterceptor';



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

// 2. Home Screen Component
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
  // geminiService,
  onBack 
}: { 
  words: WordItem[]; 
  category: string;
  // geminiService: React.MutableRefObject<GeminiService>;
  onBack: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<WordItem[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);

  const currentWord = words[currentIndex % words.length];

  // Prepare options (1 correct + 3 random)
  useEffect(() => {
    const distractors = words
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const options = [currentWord, ...distractors].sort(() => 0.5 - Math.random());
    setShuffledOptions(options);
    setSelectedOption(null);
    setShowNextButton(false);
  }, [currentWord, words]);

  const handleOptionClick = (id: string) => {
    setSelectedOption(id);
    if (id === currentWord.id) {
        // Correct feedback
        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // End of set loop
                setCurrentIndex(0);
            }
            setShowNextButton(false);
        }, 1000);
    } else {
        // 错误选择，显示Next按钮
        setShowNextButton(true);
    }
  };

  const handleNextClick = () => {
    if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        // End of set loop
        setCurrentIndex(0);
    }
    setSelectedOption(null);
    setShowNextButton(false);
    // 重新生成选项
    const distractors = words
      .filter(w => w.id !== words[(currentIndex + 1) % words.length].id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const nextWord = words[(currentIndex + 1) % words.length];
    const options = [nextWord, ...distractors].sort(() => 0.5 - Math.random());
    setShuffledOptions(options);
  };

  const playAudio = () => {
    // 临时禁用 Gemini TTS，使用浏览器默认 TTS
    const utterance = new SpeechSynthesisUtterance(currentWord.english);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 p-4 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 pt-2 px-2">
        <button onClick={onBack} className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{category}</span>
        <div className="w-10"></div> {/* Spacer */}
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

      {/* Bottom Section - Example and Next Button */}
      <div className="mt-6 mb-4 px-4 flex flex-col items-center gap-4">
        {/* Example Text */}
        <div className="px-5 py-3 rounded-2xl bg-white border border-stone-100 shadow-sm text-stone-500 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-400" />
            <span>{currentWord.example}</span>
        </div>
        
        {/* Next Button - Only shown when wrong answer is selected */}
        {showNextButton && (
          <button
            onClick={handleNextClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Next</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        )}
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
        <div className="w-full h-full flex flex-col bg-stone-50 overflow-hidden">
            {/* Section 1: Settings Label + Icon (Top 30%) */}
            <div className="flex items-center justify-center h-[5%]">
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="bg-stone-50 p-4 rounded-[24px] shadow-inner border border-stone-100">
                        <Settings className="w-8 h-8 text-stone-700" />
                    </div>
                    {/* "Settings" in Traditional Mongolian: ᠲᠣᠬᠢᠷᠠᠭᠤᠯᠭ᠎ᠠ */}
                    {/* <VerticalText text="ᠲᠣᠬᠢᠷᠠᠭᠤᠯᠭ᠎ᠠ" className="text-xl font-bold text-stone-800 h-40" /> */}
                </div>
            </div>
            
            {/* Middle Section: Section 2 and 3 (Middle 40%) */}
            <div className="flex items-center justify-center h-[60%] gap-8 p-4">
                {/* Section 2: Daily Goal Vertical Label */}
                <div className="flex items-center justify-center">
                    {/* "Daily Word Goal" in Traditional Mongolian: ᠡᠳᠦᠷ ᠪᠦᠷᠢ ᠶᠢᠨ ᠵᠣᠷᠢᠯᠲᠠ */}
                    <VerticalText text="ᠡᠳᠦᠷ ᠪᠦᠷᠢ ᠶᠢᠨ ᠵᠣᠷᠢᠯᠲᠠ" className="text-sm font-bold text-stone-400 h-56" />
                </div>

                {/* Section 3: Goal Input & Presets */}
                <div className="flex flex-col items-center justify-center gap-8 min-w-[240px]">
                    {/* Big Numeric Display */}
                    <div className="relative w-full">
                        <input 
                            type="number" 
                            value={inputGoal}
                            onChange={(e) => setInputGoal(e.target.value)}
                            className="w-full h-24 bg-stone-50 border-4 border-stone-100 rounded-[32px] font-extrabold text-4xl text-center text-stone-800 focus:border-blue-100 focus:bg-white focus:outline-none transition-all shadow-inner"
                        />
                    </div>

                    {/* Preset Buttons - 10, 20, 30 as row */}
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
            </div>

            {/* Section 4: Action Buttons (Bottom 30%) */}
            <div className="flex items-center justify-center h-[30%]">
                <div className="flex items-center justify-center gap-12">
                    {/* Cancel Button - Positioned on the left */}
                    <button 
                        onClick={onBack}
                        className="flex items-center justify-center p-3 hover:bg-stone-50 rounded-2xl transition-colors group"
                    >
                        {/* "Cancel" in Traditional Mongolian: ᠪᠣᠯᠢᠬᠤ */}
                        <VerticalText text="ᠪᠣᠯᠢᠬᠤ" className="text-stone-300 group-hover:text-stone-500 font-bold text-sm h-20" />
                    </button>
                    
                    {/* Save Button - Positioned on the right */}
                    <button 
                        onClick={handleSave}
                        className="w-24 h-48 bg-[#A7D9FF] text-stone-800 rounded-[32px] flex items-center justify-center hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-blue-50 group"
                    >
                        {/* "Save Changes" in Traditional Mongolian: ᠬᠠᠳᠠᠭᠠᠯᠠᠬᠤ */}
                        <VerticalText text="ᠬᠠᠳᠠᠭᠠᠯᠠᠬᠤ" className="font-bold text-lg h-36 group-hover:scale-105 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN APP ---

export default function App() {
  const [state, setState] = useState<AppState>({
    apiKey: process.env.API_KEY || null,
    currentView: 'home',
    words: [],
    learnedCount: 15,
    dailyGoal: 20,
    reviewCount: 0,
    reviewTotal: 5,
    selectedCategory: 'General'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  // 临时禁用 GeminiService
  // const geminiService = useRef(new GeminiService(state.apiKey || ''));
  const geminiService = useRef(null as any);

  // useEffect(() => {
  //   if (state.apiKey) {
  //     geminiService.current.updateApiKey(state.apiKey);
  //   }
  // }, [state.apiKey]);

  // 组件挂载时加载初始单词列表
  useEffect(() => {
    const loadInitialWords = async () => {
      // 只加载数据，不改变视图
      setIsLoading(true);
      try {
        const response = await fetch(`/api/word/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        console.log(data)
        data = data.data.data
        const newWords = Array.isArray(data) ? data : (data.words || []);
        
        setState(prev => ({ 
          ...prev, 
          words: newWords,
          selectedCategory: 'General' 
        }));
      } catch (e) {
        console.error("Failed to fetch initial words from API", e);
        // 即使失败也保持在首页
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialWords();
  }, []);

  const handleGenerateWords = async (categoryOverride?: WordCategory) => {
    const categoryToUse = categoryOverride || state.selectedCategory;
    
    setIsLoading(true);
    try {
      // 调用真实后台接口获取单词列表
      const response = await fetch(`/api/word/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();
      console.log(data)
      data = data.data.data
      // 假设后端返回的数据格式为 { words: WordItem[] } 或直接是 WordItem[]
      const newWords = Array.isArray(data) ? data : (data.words || []);
      
      setState(prev => ({ 
        ...prev, 
        words: newWords,
        currentView: 'study', // 现在只在明确选择学习时跳转
        selectedCategory: categoryToUse 
      }));
    } catch (e) {
      console.error("Failed to fetch words from API", e);
      alert("Failed to load words from server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setShowLibrary(false);
    }
  };

  const handleLibrarySelect = (cat: WordCategory) => {
      setState(prev => ({ ...prev, selectedCategory: cat }));
  };

  const handleLibraryConfirm = () => {
      handleGenerateWords(state.selectedCategory);
  };

  const setDailyGoal = (goal: number) => {
      setState(prev => ({ ...prev, dailyGoal: goal }));
  };

  if (isLoading) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 space-y-6 relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center opacity-5">
                 <div className="w-64 h-64 border-8 border-stone-900 rounded-full animate-ping"></div>
             </div>
             
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin z-10" />
            <div className="flex flex-col items-center z-10">
                <span className="text-stone-800 font-bold text-lg">Generating {state.selectedCategory} Lesson</span>
                <span className="text-stone-500 text-sm">Consulting AI...</span>
            </div>
        </div>
    );
  }

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