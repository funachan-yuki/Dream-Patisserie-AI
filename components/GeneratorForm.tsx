import React, { useState } from 'react';
import { Search, ArrowRight, Settings2, X } from 'lucide-react';
import { LoadingState } from '../types';

interface GeneratorFormProps {
  onGenerate: (keyword: string, constraints?: { cost?: string; price?: string }) => void;
  loadingState: LoadingState;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, loadingState }) => {
  const [keyword, setKeyword] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [targetCost, setTargetCost] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      const constraints = {
        cost: targetCost.trim() || undefined,
        price: targetPrice.trim() || undefined
      };
      onGenerate(keyword, constraints);
    }
  };

  const isLoading = loadingState === LoadingState.GENERATING_TEXT || loadingState === LoadingState.GENERATING_IMAGE;

  return (
    <div className="w-full max-w-lg flex flex-col items-center">
      <form onSubmit={handleSubmit} className="relative group w-full z-20">
        <div className="relative flex items-center bg-white border border-[#EAE0D5] rounded-full p-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_30px_-4px_rgba(229,152,155,0.2)]">
          <div className="pl-6 text-[#9D8189]">
            <Search size={20} strokeWidth={1.5} />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="桜, 夏の思い出, 宝石..."
            className="w-full px-4 py-4 bg-transparent outline-none text-[#4A4A4A] placeholder-[#C5B4B8] font-medium font-serif"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className={`mr-1 px-8 py-3 rounded-full flex items-center gap-2 transition-all duration-500 font-display text-sm tracking-wide
              ${isLoading || !keyword.trim() 
                ? 'bg-[#F2F2F2] text-[#BDBDBD] cursor-not-allowed' 
                : 'bg-[#4A4A4A] text-white hover:bg-[#E5989B] shadow-md'}`}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span className="italic">Create</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Settings Toggle */}
      <div className="mt-4 relative w-full z-10">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`mx-auto flex items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-300 ${showSettings ? 'text-[#E5989B]' : 'text-[#9D8189] hover:text-[#E5989B]'}`}
        >
          {showSettings ? <X size={14} /> : <Settings2 size={14} />}
          <span>Budget & Price</span>
        </button>

        {/* Expandable Settings Panel */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${showSettings ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}
        >
          <div className="bg-white/80 backdrop-blur-sm border border-[#EAE0D5] rounded-xl p-6 grid grid-cols-2 gap-4 shadow-sm mx-4">
             <div className="space-y-2">
               <label className="block text-xs text-[#9D8189] font-display tracking-wider">Target Cost (¥)</label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5B4B8] text-sm">¥</span>
                 <input
                    type="number"
                    value={targetCost}
                    onChange={(e) => setTargetCost(e.target.value)}
                    placeholder="300"
                    className="w-full pl-7 pr-3 py-2 bg-[#FAF9F6] border border-[#EAE0D5] rounded-lg text-sm text-[#4A4A4A] focus:outline-none focus:border-[#E5989B] transition-colors placeholder-[#E0E0E0]"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <label className="block text-xs text-[#9D8189] font-display tracking-wider">Target Price (¥)</label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5B4B8] text-sm">¥</span>
                 <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="800"
                    className="w-full pl-7 pr-3 py-2 bg-[#FAF9F6] border border-[#EAE0D5] rounded-lg text-sm text-[#4A4A4A] focus:outline-none focus:border-[#E5989B] transition-colors placeholder-[#E0E0E0]"
                 />
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorForm;