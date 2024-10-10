"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RotatingLines } from "react-loader-spinner";
import ReactCardFlip from "react-card-flip";

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
  const fullText = Array.from("寻找穿越千年的心意相通");

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < fullText.length) {
        const nextChar = fullText[index]; // 先将 fullText[index] 的值保存到一个变量中
        setText((prev) => {
          return prev + nextChar; // 在 setText 函数中使用这个变量
        });
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 200); // 200ms 打字间隔
    return () => clearInterval(intervalId);
  }, []);

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
        signal, // 将 signal 传递给 fetch
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

    // 取消之前的描述获取请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController 实例
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    // 清理上一次的数据
    setResponse([]);
    setDescriptions([]);
    setFlippedIndexes([]);

    setIsSubmitting(true);
    setIsBlurred(true); // 开始加载时模糊卡片
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
      setIsBlurred(false); // 移除模糊效果
      setIsLoading(false);
      setIsSubmitting(false);

      // Fetch descriptions for each poem in the background
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
    <div className="grid min-h-screen w-full bg-primary grid place-items-center">
      <div className="flex flex-col items-center justify-center bg-background/80 p-4 w-full"> 
        <div className="max-w-4xl w-full space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex space-x-4">
              <img src="/ci_rhythmic_topK.png" className="w-50 h-40 object-cover rounded-full" />
            </div>
            
            <div className="relative w-full">
              <Textarea
                className="pr-16 w-full"
                rows={3}
                placeholder="写下此刻感受，寻找穿越千年的心意相通..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={isSubmitting ? 'bg-gray-400 cursor-not-allowed' : ''}
                >
                  ✉️ 
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="relative">
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
              ))
            ) : response.length === 0 ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} >
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
              ))
            ) : (
              response.map((item, index) => (
                <ReactCardFlip key={index} isFlipped={flippedIndexes.includes(index)} >
                  <div className="card-wrapper">
                  <Card onClick={() => handleCardClick(index)} className={`${isBlurred ? 'blur-sm' : ''}`}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-10 h-10 border">
                            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-semibold">{item.author}</div>
                        </div>
                        <div className="text-xs text-gray-500">{item.dynasty}</div>
                      </div>
                      <div className="text-gray-500 text-sm">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p>{item.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                  <div className="card-wrapper">
                    <Card onClick={() => handleCardClick(index)}>
                      <CardContent className="p-6 space-y-4 flex items-center justify-center">
                        <div className="text-sm font-semibold">{descriptions[index]}</div>
                      </CardContent>
                    </Card>
                  </div>
                </ReactCardFlip>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
