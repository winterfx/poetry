import React, { useEffect, useRef } from 'react';

const characters = [
  "李白", "杜甫", "白居易", "苏轼", 
  "王维", "陶渊明", "李清照", "辛弃疾",
  "杜牧", "李商隐", "柳宗元", "韩愈",
  "欧阳修", "陆游", "孟浩然", "王安石",
  "岑参", "温庭筠", "元稹", "贾岛",
  "诗", "词", "赋", "韵", "律", "绝",
  "唐", "宋", "元", "明", "清", "风",
  "花", "月", "雪", "酒", "茶", "梦",
  "春", "夏", "秋", "冬", "山", "水",
  "云", "雨", "情", "意", "心", "景",
  "竹", "松", "梅", "兰", "菊", "桂"
];

export const FallingCharacters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小为窗口大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // 设置缩放以适应设备像素比
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 定义飘落的字符
    class FallingChar {
      x: number;
      y: number;
      char: string;
      speed: number;
      opacity: number;
      fontSize: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.char = characters[Math.floor(Math.random() * characters.length)];
        this.speed = 0.5 + Math.random() * 1; 
        this.opacity = 0.6 + Math.random() * 0.3; 
        this.fontSize = 14 + Math.random() * 16; 
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`; 
        ctx.font = `${this.fontSize}px "KaiTi", "楷体", serif`;
        ctx.fillText(this.char, this.x, this.y);
      }

      update() {
        this.y += this.speed;
        if (this.y > window.innerHeight) {
          this.y = -20;
          this.x = Math.random() * window.innerWidth;
          this.char = characters[Math.floor(Math.random() * characters.length)];
          this.opacity = 0.6 + Math.random() * 0.3;
          this.fontSize = 14 + Math.random() * 16;
        }
      }
    }

    // 创建多个飘落的字符
    const fallingChars: FallingChar[] = [];
    const charCount = Math.floor(window.innerWidth / 30); 
    
    for (let i = 0; i < charCount; i++) {
      fallingChars.push(
        new FallingChar(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight
        )
      );
    }

    // 动画循环
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      fallingChars.forEach(char => {
        char.draw(ctx);
        char.update();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 0,
        opacity: 1 
      }}
    />
  );
};
