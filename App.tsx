import React, { useState, useCallback } from 'react';
import { SweetsData, LoadingState } from './types';
import { generateSweetsIdea, generateSweetsImage } from './services/geminiService';
import GeneratorForm from './components/GeneratorForm';
import ResultDisplay from './components/ResultDisplay';
import { Sparkles, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [sweetsData, setSweetsData] = useState<SweetsData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (keyword: string, constraints?: { cost?: string; price?: string }) => {
    setLoadingState(LoadingState.GENERATING_TEXT);
    setError(null);
    setSweetsData(null);
    setGeneratedImage(null);

    try {
      // Step 1: Generate Text Data with constraints
      const data = await generateSweetsIdea(keyword, { constraints });
      setSweetsData(data);
      setLoadingState(LoadingState.GENERATING_IMAGE);

      // Step 2: Generate Main Image AND Recipe Sketches in parallel
      
      // Main Image Promise
      const mainImagePromise = generateSweetsImage(data.visualPrompt, 'photo')
        .catch(e => {
          console.error("Failed to generate main image", e);
          return null;
        });

      // Sketch Images Promise
      const sketchPromises = data.recipe.map(step => 
        generateSweetsImage(step.visualPrompt, 'sketch')
          .catch(e => {
            console.error(`Failed to generate sketch for step ${step.step}`, e);
            return null;
          })
      );

      const [mainImage, sketches] = await Promise.all([
        mainImagePromise,
        Promise.all(sketchPromises)
      ]);
      
      setGeneratedImage(mainImage);

      // Update data with generated sketches
      const updatedRecipe = data.recipe.map((step, index) => ({
        ...step,
        imageUrl: sketches[index]
      }));

      setSweetsData({ ...data, recipe: updatedRecipe });
      setLoadingState(LoadingState.COMPLETED);

    } catch (err) {
      console.error(err);
      setError("アイデアの生成中にエラーが発生しました。もう一度お試しください。");
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  const handleRefine = useCallback(async (instruction: string) => {
    if (!sweetsData) return;

    setLoadingState(LoadingState.GENERATING_TEXT);
    setError(null);
    
    try {
      // Step 1: Refine Text Data
      const data = await generateSweetsIdea('', { refinementContext: { currentData: sweetsData, instruction } });
      setSweetsData(data);
      setLoadingState(LoadingState.GENERATING_IMAGE);

      // Step 2: Generate New Images
       const mainImagePromise = generateSweetsImage(data.visualPrompt, 'photo')
        .catch(e => {
          console.error("Failed to generate main image", e);
          return null;
        });

      const sketchPromises = data.recipe.map(step => 
        generateSweetsImage(step.visualPrompt, 'sketch')
          .catch(e => {
             console.error(`Failed to generate sketch for step ${step.step}`, e);
             return null;
          })
      );

      const [mainImage, sketches] = await Promise.all([
        mainImagePromise,
        Promise.all(sketchPromises)
      ]);

      setGeneratedImage(mainImage);
      
      const updatedRecipe = data.recipe.map((step, index) => ({
        ...step,
        imageUrl: sketches[index]
      }));

      setSweetsData({ ...data, recipe: updatedRecipe });
      setLoadingState(LoadingState.COMPLETED);

    } catch (err) {
      console.error(err);
      setError("修正案の生成中にエラーが発生しました。");
      setLoadingState(LoadingState.ERROR);
    }
  }, [sweetsData]);

  const handleReset = useCallback(() => {
    setSweetsData(null);
    setGeneratedImage(null);
    setError(null);
    setLoadingState(LoadingState.IDLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A4A4A] selection:bg-[#E5989B] selection:text-white">
      
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <div className="inline-flex flex-col items-center">
          <div className="text-xs tracking-[0.3em] text-[#9D8189] uppercase mb-2 font-display">
            AI Patisserie Creative
          </div>
          <h1 className="text-4xl md:text-5xl font-display italic font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#4A4A4A] to-[#6D6875] pb-2 cursor-pointer" onClick={handleReset}>
            Dream Patisserie
          </h1>
          <div className="w-16 h-0.5 bg-[#E5989B] mt-4 rounded-full"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Intro */}
        {loadingState === LoadingState.IDLE && !sweetsData && (
          <div className="text-center mb-16 space-y-6 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-light text-[#6D6875] leading-relaxed">
              新しいスイーツの<br className="sm:hidden"/>インスピレーションをあなたに
            </h2>
            <p className="text-[#8D8D8D] max-w-lg mx-auto leading-loose text-sm md:text-base font-sans">
              パティシエの感性とAIの技術が織りなす、<br/>
              世界に一つだけのレシピとデザイン。
            </p>
          </div>
        )}

        <div className={`flex justify-center mb-16 transition-all duration-500 ${sweetsData ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
          <GeneratorForm onGenerate={handleGenerate} loadingState={loadingState} />
        </div>

        {/* Loading Indicators */}
        {loadingState === LoadingState.GENERATING_TEXT && !sweetsData && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="relative">
              <div className="w-20 h-20 border border-[#E5989B]/30 rounded-full animate-ping absolute top-0 left-0"></div>
              <div className="w-20 h-20 border-t-2 border-[#E5989B] rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-xl font-display text-[#6D6875] italic">Thinking...</p>
            <p className="text-xs tracking-widest text-[#9D8189] mt-2 uppercase">Creating Concept</p>
          </div>
        )}

        {/* Regeneration Loading (Overlay or separate view) */}
        {(loadingState === LoadingState.GENERATING_TEXT || loadingState === LoadingState.GENERATING_IMAGE) && sweetsData && (
           <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
             <div className="mb-10 text-center space-y-2 animate-fadeIn">
                <h3 className="text-3xl font-serif text-[#4A4A4A]">{sweetsData.name}</h3>
                <div className="flex justify-center gap-2 text-[#E5989B]">
                  <Sparkles size={16} />
                  <span className="text-sm">
                    {loadingState === LoadingState.GENERATING_TEXT ? "レシピを再考中..." : "スケッチを描画中..."}
                  </span>
                  <Sparkles size={16} />
                </div>
             </div>
             <div className="relative">
               <div className="w-24 h-24 border border-[#B5EAD7]/30 rounded-full animate-ping absolute top-0 left-0"></div>
               <div className="w-24 h-24 border-t-2 border-[#B5EAD7] rounded-full animate-spin"></div>
             </div>
             <p className="mt-8 text-xl font-display text-[#6D6875] italic">
                {loadingState === LoadingState.GENERATING_TEXT ? "Refining..." : "Sketching Steps..."}
             </p>
           </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-xl mx-auto bg-[#FFF5F5] border-l-4 border-[#E5989B] text-[#4A4A4A] px-8 py-6 shadow-sm mb-12">
            <p className="font-serif text-lg mb-2 text-[#E5989B]">Error</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}

        {/* Results */}
        {sweetsData && (loadingState === LoadingState.COMPLETED || loadingState === LoadingState.IDLE) && (
           <div className="animate-fadeIn relative">
              <button 
                onClick={handleReset}
                className="absolute left-0 -top-12 md:-top-4 z-10 flex items-center gap-2 text-[#9D8189] hover:text-[#E5989B] transition-colors font-sans text-sm tracking-wider group bg-[#FDFBF7]/80 backdrop-blur-sm px-3 py-1 rounded-full"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Top</span>
              </button>
              <ResultDisplay 
                data={sweetsData} 
                imageUrl={generatedImage} 
                onRefine={handleRefine}
                isRefining={loadingState !== LoadingState.COMPLETED && loadingState !== LoadingState.IDLE}
                onReset={handleReset}
              />
           </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE0D5] py-12 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-display italic text-[#6D6875] text-lg mb-4">Dream Patisserie</p>
          <div className="flex justify-center items-center gap-4 text-xs text-[#9D8189] tracking-widest uppercase">
            <span>AI Generated</span>
            <span className="w-1 h-1 bg-[#E5989B] rounded-full"></span>
            <span>Gemini Powered</span>
          </div>
          <p className="mt-8 text-[10px] text-[#BDBDBD]">
            © {new Date().getFullYear()} Dream Patisserie AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;