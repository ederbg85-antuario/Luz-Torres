const words = [
  "Un nuevo lugar",
  "Otra forma de vivir",
  "Tu siguiente historia",
];

export function HomeMarquee() {
  return (
    <div className="home-marquee" data-motion-scene aria-hidden="true">
      <div className="marquee-track motion-loop">
        {[0, 1].map((copy) => (
          <div className="marquee-copy" key={copy}>
            {words.map((word) => (
              <span key={word}>
                {word}
                <span className="marquee-star">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
