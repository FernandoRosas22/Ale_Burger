const VIDEOS = [1, 2, 3, 4];

export default function VideosSection() {
  return (
    <section id="videos" className="ab-section ab-videos">
      <div className="ab-menu-header">
        <p className="ab-section-tag">Mirá cómo las hacemos</p>
        <h2 className="ab-section-title">NUESTROS <span>VIDEOS</span></h2>
        <p>El proceso, el sabor, la magia. Todo en video.</p>
      </div>
      <div className="ab-scroller">
        <div className="ab-scroller-track ab-videos-track">
          {VIDEOS.map((n) => (
            <div className="ab-video-card" key={n}>
              <video src={`/media/hamburguesa_${n}.mp4`} autoPlay muted loop playsInline />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
