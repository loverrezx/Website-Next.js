"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface Announcement {
  id: number;
  text: string;
  sortOrder: number;
}

export default function Home() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const autoplay = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay.current]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    fetch("/api/admin/carousel")
      .then((r) => r.json())
      .then((d) => setImages(d.images || []))
      .catch(() => {});

    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {});
  }, []);

  const announcementText =
    announcements.length > 0
      ? announcements.map((a) => a.text).join("   ·   ")
      : "ไม่มีการประกาศข่าวสาร ณ ตอนนี้";

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Carousel */}
      {images.length > 0 && (
        <div style={{ position: "relative", width: "100%", maxWidth: "900px", margin: "0 auto 1rem" }}>
          <div
            ref={emblaRef}
            style={{
              overflow: "hidden",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--navbar-border)",
              boxShadow: "var(--shadow-premium)",
            }}
          >
            <div style={{ display: "flex" }}>
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    flex: "0 0 100%",
                    minWidth: 0,
                    position: "relative",
                    height: "clamp(180px, 40vw, 360px)",
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.45)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  zIndex: 2,
                  backdropFilter: "blur(4px)",
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.45)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  zIndex: 2,
                  backdropFilter: "blur(4px)",
                }}
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "6px",
                  zIndex: 2,
                }}
              >
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    style={{
                      width: i === selectedIndex ? "22px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      border: "none",
                      background: i === selectedIndex ? "var(--primary)" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "width 0.3s ease, background 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Marquee Announcement */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          overflow: "hidden",
          background: "var(--primary-light)",
          border: "1px solid var(--navbar-border)",
          borderRadius: "8px",
          padding: "0.6rem 0",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            paddingLeft: "1rem",
            fontWeight: "700",
            fontSize: "0.82rem",
            color: "var(--primary)",
            whiteSpace: "nowrap",
          }}
        >
          ประกาศ
        </span>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              boxSizing: "content-box" as const,
              whiteSpace: "nowrap",
              animation: "marquee 18s linear infinite",
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
            }}
          >
            {announcementText}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </main>
  );
}
