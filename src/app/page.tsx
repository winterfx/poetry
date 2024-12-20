// pages/index.tsx
import { Component } from "@/components/component";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* 背景图层 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(255, 251, 235, 1) 0%, rgba(245, 238, 220, 1) 100%),
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23998876' fill-opacity='0.05'%3E%3Cpath d='M0 0h100v100H0z'/%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='%23998876' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundBlendMode: 'overlay',
        }}
      />

      {/* 内容 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Component />
      </div>
    </div>
  );
}