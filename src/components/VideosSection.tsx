import { useRef, useEffect } from "react";

const VIDEOS = [1, 2, 3, 4];

function VideoCard({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // IntersectionObserver: play solo cuando el video es visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ab-video-card">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}

export default function VideosSection() {
  return (
    <section id="videos" className="ab-section ab-videos">
      <div className="ab-menu-header">
        <p className="ab-section-tag">Mirá cómo las hacemos</p>
        <h2 className="ab-section-title">NUESTROS <span>VIDEOS</span></h2>
        <p>El proceso, el sabor, la magia. Todo en video.</p>
      </div>
      <div className="ab-videos-grid">
        {VIDEOS.map((n) => (
          <VideoCard key={n} src={`/media/hamburguesa_${n}.mp4`} />
        ))}
      </div>
    </section>
  );
}
