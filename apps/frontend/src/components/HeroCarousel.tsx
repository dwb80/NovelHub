'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselItem {
  id: string
  title: string
  description: string
  cover?: string
  authorName: string
}

interface HeroCarouselProps {
  items: CarouselItem[]
  autoPlay?: boolean
  interval?: number
}

export default function HeroCarousel({ 
  items, 
  autoPlay = true, 
  interval = 5000 
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (!autoPlay || isPaused || items.length <= 1) return

    const timer = setInterval(goToNext, interval)
    return () => clearInterval(timer)
  }, [autoPlay, isPaused, interval, goToNext, items.length])

  if (items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div 
      className="relative w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 背景图 - 增强视觉效果 */}
      <div className="absolute inset-0">
        {currentItem.cover ? (
          <Image
            src={currentItem.cover}
            alt={currentItem.title}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
        )}
        {/* 多层渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* 装饰元素 */}
      <div className="absolute top-4 right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-4 left-1/3 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

      {/* 内容 */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                精选推荐
              </span>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {items.length}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 line-clamp-2 leading-tight">
              {currentItem.title}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-2 flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded-full bg-primary/10 text-center leading-6 text-xs">👤</span>
              {currentItem.authorName}
            </p>
            <p className="text-sm text-muted-foreground/80 mb-5 line-clamp-2 max-w-lg leading-relaxed">
              {currentItem.description}
            </p>
            <Link
              href={`/novels/${currentItem.id}`}
              className="group inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <span>立即阅读</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* 左右箭头 - 更精致的设计 */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:scale-110"
            aria-label="上一个"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:scale-110"
            aria-label="下一个"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}

      {/* 指示器 - 更美观的设计 */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-primary shadow-lg shadow-primary/30'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50 hover:scale-110'
              }`}
              aria-label={`跳转到第${index + 1}张`}
            />
          ))}
        </div>
      )}

    </div>
  )
}
