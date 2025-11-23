import React, { useState } from 'react';
import { SweetsData } from '../types';
import { Sparkles, Utensils, Send, Edit3, RefreshCw } from 'lucide-react';
import CostChart from './CostChart';

interface ResultDisplayProps {
  data: SweetsData;
  imageUrl: string | null;
  onRefine: (instruction: string) => void;
  isRefining: boolean;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, imageUrl, onRefine, isRefining, onReset }) => {
  const [refinementText, setRefinementText] = useState('');

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinementText.trim()) {
      onRefine(refinementText);
      setRefinementText('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn pb-12">
      
      {/* Title Section */}
      <div className="text-center mb-16 relative">
        <span className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#EAE0D5] to-transparent -z-10"></span>
        <div className="inline-block bg-[#FDFBF7] px-8">
          <h2 className="text-4xl md:text-5xl font-serif text-[#4A4A4A] font-medium tracking-wide">
            {data.name}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        
        {/* Left Column: Visuals (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Image Card */}
          <div className="bg-white p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] rounded-sm rotate-1 hover:rotate-0 transition-transform duration-700 ease-out border border-[#EAE0D5]">
            <div className="aspect-[4/5] w-full relative overflow-hidden bg-[#F5F5F5]">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={data.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#C5B4B8] font-display italic">
                  Image Loading...
                </div>
              )}
            </div>
            <div className="pt-4 text-center">
               <p className="font-display italic text-[#9D8189] text-sm">Vue de l'esprit</p>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white/50 backdrop-blur-sm p-8 border-l-2 border-[#E5989B]">
            <h3 className="text-sm font-display tracking-widest text-[#9D8189] uppercase mb-4">Concept Story</h3>
            <p className="text-[#6D6875] leading-loose text-justify font-sans text-sm md:text-base">
              {data.description}
            </p>
          </div>
        </div>

        {/* Right Column: Details (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Financials Summary */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-[#EAE0D5] shadow-sm text-center">
              <p className="text-xs tracking-widest text-[#9D8189] uppercase mb-2">Cost Price</p>
              <div className="font-display text-3xl text-[#4A4A4A]">
                ¥{data.totalCost.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#BDBDBD] mt-1">per unit</p>
            </div>
            <div className="bg-[#4A4A4A] p-6 text-center text-white shadow-lg">
              <p className="text-xs tracking-widest text-[#BDBDBD] uppercase mb-2">Suggested Price</p>
              <div className="font-display text-3xl text-[#E5989B]">
                ¥{data.suggestedPrice.toLocaleString()}
              </div>
              <div className="flex justify-center items-center gap-2 mt-1">
                 <span className="text-[10px] bg-[#E5989B]/20 px-2 py-0.5 rounded text-[#E5989B]">Margin {data.profitMargin}%</span>
              </div>
            </div>
          </div>

          {/* Ingredients Receipt */}
          <div className="bg-white p-8 md:p-10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border-t border-[#EAE0D5] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FDFBF7] p-2 rounded-full border border-[#EAE0D5]">
               <Sparkles size={16} className="text-[#E5989B]" />
            </div>
            
            <h3 className="text-center font-display text-2xl italic text-[#4A4A4A] mb-8">Recette & Coût</h3>

            <div className="space-y-3 mb-10">
              {data.ingredients.map((item, index) => (
                <div key={index} className="flex items-end text-sm group">
                  <div className="font-medium text-[#6D6875] whitespace-nowrap">{item.name}</div>
                  <div className="flex-grow border-b border-dotted border-[#C5B4B8] mx-2 mb-1 relative">
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] text-[#9D8189] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.amount}
                    </span>
                  </div>
                  <div className="font-mono text-[#4A4A4A]">¥{item.cost.toLocaleString()}</div>
                </div>
              ))}
              
              <div className="flex items-end text-base font-bold pt-4 mt-4 border-t border-[#EAE0D5]">
                <div className="text-[#4A4A4A]">Total Cost</div>
                <div className="flex-grow"></div>
                <div className="font-mono text-[#4A4A4A]">¥{data.totalCost.toLocaleString()}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="pt-6 border-t border-dashed border-[#EAE0D5]">
              <h4 className="text-center text-xs tracking-widest text-[#9D8189] uppercase mb-4">Cost Breakdown</h4>
              <CostChart ingredients={data.ingredients} />
            </div>
          </div>
          
        </div>
      </div>

      {/* Recipe Steps Section */}
      <div className="max-w-4xl mx-auto px-4 mb-20">
         <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-white border border-[#EAE0D5] rounded-full mb-4 shadow-sm">
              <Utensils size={20} className="text-[#E5989B]" />
            </div>
            <h3 className="text-3xl font-display italic text-[#4A4A4A]">Préparation</h3>
            <p className="text-[#9D8189] text-xs tracking-widest uppercase mt-2">Step by Step Guide</p>
         </div>

         <div className="space-y-12">
            {data.recipe && data.recipe.length > 0 ? (
              data.recipe.map((step, index) => (
                <div key={index} className="relative flex flex-col md:flex-row gap-8 md:gap-12 items-start group">
                  {/* Step Number */}
                  <div className="absolute -left-4 -top-4 md:left-0 md:top-0 text-6xl font-display text-[#EAE0D5] opacity-40 -z-10">
                    {step.step}
                  </div>

                  {/* Sketch Image */}
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <div className="aspect-square bg-white border border-[#EAE0D5] p-2 shadow-sm rotate-[-1deg] group-hover:rotate-0 transition-transform duration-500">
                      {step.imageUrl ? (
                        <img 
                          src={step.imageUrl} 
                          alt={`Step ${step.step}`} 
                          className="w-full h-full object-contain opacity-90" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center">
                           <div className="animate-pulse w-8 h-8 rounded-full bg-[#EAE0D5]"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="w-full md:w-2/3 pt-2">
                     <div className="flex items-center gap-3 mb-3">
                       <span className="font-display italic text-[#E5989B] text-lg">Step {step.step}</span>
                       <div className="h-[1px] bg-[#EAE0D5] flex-grow"></div>
                     </div>
                     <p className="text-[#6D6875] leading-loose font-sans text-base md:text-lg text-justify">
                        {step.description}
                     </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#9D8189] italic">Recipe details not available.</p>
            )}
         </div>
      </div>

      {/* Refinement Section (Bottom) */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="relative p-1 bg-gradient-to-r from-[#EAE0D5] via-[#E5989B] to-[#EAE0D5] rounded-lg shadow-lg">
          <div className="bg-[#FDFBF7] rounded p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center mb-4 text-[#9D8189]">
              <Edit3 size={18} className="mr-2" />
              <span className="text-xs tracking-widest uppercase font-display">Demande Spéciale</span>
            </div>
            <h4 className="font-serif text-xl text-[#4A4A4A] mb-6">シェフへの追加リクエスト</h4>
            
            <form onSubmit={handleRefineSubmit} className="relative max-w-lg mx-auto">
              <input
                type="text"
                value={refinementText}
                onChange={(e) => setRefinementText(e.target.value)}
                placeholder="「もっと安く」「抹茶味にして」「子供向けに」..."
                className="w-full pl-6 pr-14 py-4 bg-white border border-[#EAE0D5] rounded-full outline-none focus:border-[#E5989B] focus:ring-1 focus:ring-[#E5989B] transition-all text-[#4A4A4A] placeholder-[#C5B4B8]"
                disabled={isRefining}
              />
              <button 
                type="submit" 
                disabled={isRefining || !refinementText.trim()}
                className="absolute right-2 top-2 p-2 bg-[#4A4A4A] text-white rounded-full hover:bg-[#E5989B] disabled:bg-[#F2F2F2] disabled:text-[#BDBDBD] transition-colors"
              >
                {isRefining ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send size={18} strokeWidth={1.5} className="ml-0.5" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-[#BDBDBD] mt-4 font-sans">
              現在のレシピをベースに、新しいアイデアをご提案します。
            </p>
          </div>
        </div>
      </div>

      {/* Reset / Back to Top Button */}
      <div className="text-center pb-8">
        <button 
          onClick={onReset}
          className="group inline-flex items-center justify-center gap-2 text-[#9D8189] hover:text-[#E5989B] transition-colors px-8 py-3 rounded-full hover:bg-white hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-transparent hover:border-[#EAE0D5]"
        >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-display italic text-lg">Create Another Sweets</span>
        </button>
      </div>

    </div>
  );
};

export default ResultDisplay;