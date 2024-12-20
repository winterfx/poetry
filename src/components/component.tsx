"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Scroll } from "./scroll";
import { FallingCharacters } from "./falling-characters";

export function Component() {
  const [userInput, setUserInput] = useState('');
  const [text, setText] = useState('');
  const [response, setResponse] = useState<{ dynasty: string; author: string; title: string; content: string }[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [isBlurred, setIsBlurred] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleError = () => {
    const errorMessage = '出错了，请稍后再试';
    alert(errorMessage);
  };

  const fetchDescription = async (index: number, poem: { title: string; author: string; content: string }, signal: AbortSignal) => {
    try {
      const descriptionRes = await fetch('/api/poem/description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: poem.title, author: poem.author, content: poem.content }),
        signal,
      });
      const descriptionData = await descriptionRes.json();
      setDescriptions((prev) => {
        const newDescriptions = [...prev];
        newDescriptions[index] = descriptionData.description;
        return newDescriptions;
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching description:', error);
        setDescriptions((prev) => {
          const newDescriptions = [...prev];
          newDescriptions[index] = 'Error fetching description';
          return newDescriptions;
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert('请输入内容');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    setResponse([]);
    setDescriptions([]);
    setIsSubmitting(true);
    setIsBlurred(true);
    setIsLoading(true);

    try {
      const res = await fetch('/api/poems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      setResponse(data.poems);
      setIsBlurred(false);
      setIsLoading(false);
      setIsSubmitting(false);

      data.poems.forEach((poem, index) => {
        fetchDescription(index, poem, newAbortController.signal);
      });

    } catch (error) {
      setIsSubmitting(false);
      setIsLoading(false);
      handleError();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen z-10"> 
      <FallingCharacters />
      <div className="max-w-3xl w-full space-y-8 px-4">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative w-full max-w-2xl mx-auto">
            {/* 装饰性标题 */}
            <div className="text-center mb-4">
              <h1 className="font-kai text-3xl text-amber-900/90">
                <span className="opacity-70">『</span>
                心境浮光
                <span className="opacity-70">』</span>
              </h1>
              <p className="mt-2 text-sm text-amber-800/70 tracking-wider font-medium">
                一字一句，皆是千年的回响
              </p>
            </div>

            {/* 输入框容器 */}
            <div className="relative backdrop-blur-sm bg-white/70 rounded-2xl p-3 shadow-lg
                          border-2 border-amber-900/30 hover:border-amber-900/40 
                          transition-all duration-300 hover:shadow-xl">
              <Textarea
                className="w-full bg-transparent rounded-xl
                          font-kai text-lg leading-relaxed text-amber-900/90
                          placeholder:text-amber-900/50 placeholder:font-kai
                          focus:border-0 focus:ring-0 focus:outline-none
                          border-0 resize-none overflow-hidden
                          transition-all duration-300"
                rows={3}
                placeholder="写下此刻感受，寻找穿越千年的心意相通..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{
                  backgroundImage: 'linear-gradient(transparent, transparent 27px, rgba(153, 136, 118, 0.15) 28px)',
                  backgroundSize: '100% 28px',
                  lineHeight: '28px',
                }}
              />
              
              {/* 发送按钮 */}
              <div className="absolute bottom-3 right-3 transform transition-transform duration-300 hover:scale-105">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`rounded-full w-10 h-10 flex items-center justify-center
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 
                            'bg-amber-900/20 hover:bg-amber-900/30 text-amber-900/90'}`}
                >
                  {isSubmitting ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    <span className="transform -rotate-45 text-lg">✎</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 w-full max-w-4xl mx-auto">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-[200px] bg-white/60 rounded-lg"></div>
              </div>
            ))
          ) : response.length === 0 ? (
            <div className="text-center py-8">
            </div>
          ) : (
            <div className="space-y-12">
              {response.map((item, index) => (
                <Scroll
                  key={index}
                  dynasty={item.dynasty}
                  author={item.author}
                  title={item.title}
                  content={item.content}
                  description={descriptions[index] || "正在品读诗词..."}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
