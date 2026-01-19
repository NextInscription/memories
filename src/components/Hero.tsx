import { useState, useEffect } from "react";
import bgImage1 from "../assets/bg1.png";
import bgImage2 from "../assets/bg2.png";
import bgImage3 from "../assets/bg3.png";
import bgImage4 from "../assets/bg4.png";
interface Slide {
  image: string;
  tag: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    image: bgImage1,
    tag: "Tree",
    title: "Mighty Oak",
    description:
      "Standing tall through centuries of changing seasons. A testament to nature's enduring strength and wisdom.",
  },
  {
    image: bgImage2,
    tag: "Spring",
    title: "Cherry Blossoms",
    description:
      "Pink petals dancing in the gentle spring breeze. A fleeting moment of natural beauty and renewal.",
  },
  {
    image: bgImage3,
    tag: "Rainy Day",
    title: "Daisies in Rain",
    description:
      "Small flowers finding beauty in the rain. A reminder that growth often comes from life's storms.",
  },
  {
    image: bgImage4,
    tag: "Sunset",
    title: "Golden Hour",
    description:
      "The sun paints the sky in shades of gold and crimson. Nature's daily masterpiece in the evening light.",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000); // 自动播放，每5秒切换
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="@container mb-12">
      <div className="relative min-h-[520px] rounded-xl overflow-hidden shadow-2xl">
        {/* 轮播图片 */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url("${slide.image}")`,
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 @[480px]:p-16">
              <div className="max-w-xl">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                  {slide.tag}
                </span>
                <h1 className="text-white text-5xl @[480px]:text-7xl font-black leading-[1.1] serif-title mb-4 italic">
                  {slide.title}
                </h1>
                <p className="text-white/90 text-lg @[480px]:text-xl font-normal mb-8 max-w-md">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 左右导航按钮 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-12 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all z-10"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 size-12 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all z-10"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>

        {/* 底部指示器 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
