import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollProps {
  dynasty: string;
  author: string;
  title: string;
  content: string;
  description: string;
}

export function Scroll({ dynasty, author, title, content, description }: ScrollProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 将诗词内容按照换行符分割成数组
  const contentLines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div 
      className="relative w-full mb-12" 
      onClick={() => setIsOpen(!isOpen)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layout
        className="relative w-full bg-[#F5E6CB]/90 backdrop-blur-sm rounded-lg shadow-lg
                   hover:shadow-xl transition-all duration-300 cursor-pointer
                   border border-amber-900/10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 230, 203, 0.9), rgba(245, 230, 203, 0.9)),
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23998876' fill-opacity='0.03'/%3E%3C/svg%3E")
          `
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 卷轴顶部装饰 */}
        <div className="absolute -top-2 left-0 right-0 h-8 bg-gradient-to-b from-amber-800/20 to-transparent" />
        
        <div className="relative p-6">
          {/* 标题和作者信息 */}
          <div className="text-center mb-3">
            <h2 className="text-2xl font-bold text-amber-900/80 font-kai mb-1">{title}</h2>
            <p className="text-amber-800/60 font-kai">
              {dynasty} · {author}
            </p>
          </div>
          
          {/* 诗词内容 */}
          <div className="flex justify-center items-center">
            <div className="font-kai text-lg text-gray-800 leading-relaxed tracking-wider text-center">
              {contentLines.map((line, index) => (
                <React.Fragment key={index}>
                  <span>{line}</span>
                  {index < contentLines.length - 1 && <span className="mx-3">，</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* 赏析内容 */}
          <motion.div
            initial={false}
            animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-amber-900/10 mt-4">
              <p className="text-gray-700 font-kai leading-relaxed">
                {description}
              </p>
            </div>
          </motion.div>

          {/* 提示点击查看赏析 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered && !isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex items-center space-x-1 text-amber-900/60 text-sm font-kai">
              <span>点击查看赏析</span>
              <svg 
                className="w-4 h-4 animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </motion.div>
        </div>
        
        {/* 卷轴底部装饰 */}
        <div className="absolute -bottom-2 left-0 right-0 h-8 bg-gradient-to-t from-amber-800/20 to-transparent" />
      </motion.div>
    </div>
  );
}
