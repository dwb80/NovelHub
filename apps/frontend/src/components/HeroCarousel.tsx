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
      className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 背景图 */}
      <div className="absolute inset-0">
        {currentItem.cover ? (
          <Image
            src={currentItem.cover}
            alt={currentItem.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* 内容 */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 mb-4 text-sm rounded-full bg-primary/10 text-primary">
              精选推荐
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 line-clamp-2">
              {currentItem.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              {currentItem.authorName}
            </p>
            <p className="text-muted-foreground mb-6 line-clamp-2 max-w-xl">
              {currentItem.description}
            </p>
            <Link
              href={`/novels/${currentItem.id}`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              立即阅读
            </Link>
          </div>
        </div>
      </div>

      {/* 左右箭头 */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors"
            aria-label="上一个"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors"
            aria-label="下一个"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* 指示器 */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`跳转到第${index + 1}张`}
            />
          ))}
        </div>
      )}

      {/* 进度条 */}
      {autoPlay && items.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}
