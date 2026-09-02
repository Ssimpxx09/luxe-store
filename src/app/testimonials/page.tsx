"use client";

import { useEffect, useState } from "react";
import { Stars } from "@/components/ProductCard";
import type { Testimonial } from "@/lib/types";

export default function TestimonialsPage() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [i, setI] = useState(0);
  useEffect(() => {
    fetch("/api/testimonials").then((r) => r.json()).then((d) => setList(d.testimonials || []));
  }, []);
  return (
    <div className="container page">
      <h1>What Our Customers Say</h1>
      <div className="quotes">
        {list.map((t, idx) => (
          <article key={t.id} className="quote" style={{ opacity: idx === i ? 1 : 0.65 }}>
            <img src={t.avatar} alt="" />
            <div>
              <strong>{t.name}</strong>
              <Stars value={t.rating} />
              <p>{t.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="dots">
        {list.map((t, idx) => (
          <i key={t.id} className={idx === i ? "on" : ""} onClick={() => setI(idx)} />
        ))}
      </div>
    </div>
  );
}
