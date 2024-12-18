"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardWrapper } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RotatingLines } from "react-loader-spinner";
import ReactCardFlip from "react-card-flip";
import { FallingCharacters } from "./falling-characters";

export function Component() {
  const [userInput, setUserInput] = useState('');
  const [text, setText] = useState('');
  const [response, setResponse] = useState<{ dynasty: string; author: string; title: string; content: string }[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [isBlurred, setIsBlurred] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
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
    setFlippedIndexes([]);

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

  const handleCardClick = (index: number) => {
    setFlippedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div 
      className="relative min-h-screen w-full"
      style={{
        background: `linear-gradient(to right,
          rgb(186, 154, 112),
          rgb(175, 143, 101),
          rgb(186, 154, 112)
        )`
      }}
    >
      <FallingCharacters />
      <div className="relative flex flex-col items-center justify-center w-full min-h-screen z-10"> 
        <div className="max-w-3xl w-full space-y-8 px-4">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-full backdrop-blur-sm bg-white/40 rounded-xl p-2 shadow-lg">
              <Textarea
                className="pr-16 w-full bg-white/60 rounded-lg border-2 border-amber-900/20
                          font-kai text-lg placeholder:text-gray-600/80 placeholder:font-kai
                          focus:border-amber-900/40 focus:ring-amber-900/40 transition-all duration-300"
                rows={3}
                placeholder="写下此刻感受，寻找穿越千年的心意相通..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`rounded-full p-3 hover:scale-110 transition-all duration-300 
                            ${isSubmitting ? 'bg-gray-400/70 cursor-not-allowed' : 
                                          'bg-amber-800/10 hover:bg-amber-800/20 border-amber-900/20'}`}
                >
                  <span className="text-xl">✉️</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <CardWrapper key={index}>
                  <Card className="relative mx-auto w-full min-h-[300px] backdrop-blur-sm bg-white/60 border-2 border-amber-900/20 shadow-lg">
                    <CardContent className="p-6 space-y-4 blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-10 h-10 border">
                            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-semibold">李清照</div>
                        </div>
                        <div className="text-xs text-gray-500">宋</div>
                      </div>
                      <div className="text-gray-500 text-sm">
                        <h3 className="font-semibold">如梦令·昨夜雨疏风骤</h3>
                        <p>昨夜雨疏风骤，浓睡不消残酒。试问卷帘人，却道海棠依旧。知否，知否？应是绿肥红瘦。</p>
                      </div>
                    </CardContent>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RotatingLines
                        strokeColor="black"
                        strokeWidth="3"
                        animationDuration="0.75"
                        width="80"
                        visible={true}
                      />
                    </div>
                  </Card>
                </CardWrapper>
              ))
            ) : response.length === 0 ? (
              Array.from({ length: 3 }).map((_, index) => (
                <CardWrapper key={index}>
                  <Card className="mx-auto w-full min-h-[300px] backdrop-blur-sm bg-white/60 border-2 border-amber-900/20 shadow-lg">
                    <CardContent className="p-6 space-y-4 blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-10 h-10 border">
                            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-semibold">李清照</div>
                        </div>
                        <div className="text-xs text-gray-500">宋</div>
                      </div>
                      <div className="text-gray-500 text-sm">
                        <h3 className="font-semibold">如梦令·昨夜雨疏风骤</h3>
                        <p>昨夜雨疏风骤，浓睡不消残酒。试问卷帘人，却道海棠依旧。知否，知否？应是绿肥红瘦。</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardWrapper>
              ))
            ) : (
              response.map((item, index) => (
                <ReactCardFlip key={index} isFlipped={flippedIndexes.includes(index)}>
                  <CardWrapper>
                    <Card 
                      onClick={() => handleCardClick(index)} 
                      className={`backdrop-blur-sm bg-white/60 border-2 border-amber-900/20 shadow-lg
                                hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[300px]
                                ${isBlurred ? 'blur-sm' : ''}`}
                    >
                      <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-amber-900/20">
                              <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                              <AvatarFallback>诗</AvatarFallback>
                            </Avatar>
                            <div className="font-kai text-lg text-amber-900">{item.author}</div>
                          </div>
                          <div className="text-base text-amber-800/70 font-kai">{item.dynasty}</div>
                        </div>
                        <div className="space-y-3 mt-3">
                          <h3 className="font-kai text-xl text-amber-900 border-b border-amber-900/20 pb-3">{item.title}</h3>
                          <p className="font-kai text-lg text-gray-700 leading-relaxed whitespace-pre-line">{item.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </CardWrapper>
                  <CardWrapper>
                    <Card 
                      onClick={() => handleCardClick(index)}
                      className="backdrop-blur-sm bg-white/60 border-2 border-amber-900/20 shadow-lg
                               hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[300px]"
                    >
                      <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                        <div className="font-kai text-lg text-gray-700 leading-relaxed">{descriptions[index]}</div>
                      </CardContent>
                    </Card>
                  </CardWrapper>
                </ReactCardFlip>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
