"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageSwiperProps extends React.HTMLAttributes<HTMLDivElement> {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showControls?: boolean;
}

export function ImageSwiper({
  images,
  autoPlay = false,
  autoPlayInterval = 3000,
  showIndicators = true,
  showControls = true,
  className,
  ...props
}: ImageSwiperProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(autoPlay);

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, autoPlayInterval]);

  const handleMouseEnter = () => {
    if (autoPlay) setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    if (autoPlay) setIsAutoPlaying(true);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Main Image Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width || 800}
                height={image.height || 1050}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {showControls && images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={nextSlide}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* QR Badge - Positioned outside the rounded container */}
      <div className="absolute -top-4 -right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg z-10">
        QR
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                index === currentIndex
                  ? "bg-gray-900 dark:bg-gray-100"
                  : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-400"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
