import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useI18n } from "@/context/I18nContext";
import vaibhavImg from "@/assets/founder-vaibhav.jpg";
import rupaliImg from "@/assets/founder-rupali.jpg";
import paragImg from "@/assets/founder-parag.jpg";

type FounderData = {
  name: string;
  image: string | null;
  initials: string;
  tagline: string;
  bio: string;
  accent: string;
  role: string;
  premium?: boolean;
};

const founders: FounderData[] = [
  {
    name: "Vaibhav Thite",
    image: vaibhavImg,
    initials: "VT",
    role: "Co-Founder",
    tagline: "Turning ideas into real-world digital solutions.",
    bio: "A driven BCA student focused on building practical digital systems with strong interest in web development, automation, and real-world problem solving.",
    accent: "from-violet-300 via-indigo-300 to-blue-300",
  },
  {
    name: "Rupali Singh",
    image: rupaliImg,
    initials: "RS",
    role: "Co-Founder",
    tagline: "Designing experiences that are simple, functional, and impactful.",
    bio: "A web developer focused on clean UI/UX, responsive design, and improving user experience through real-world projects and collaboration.",
    accent: "from-rose-200 via-amber-200 to-violet-300",
  },
  {
    name: "Parag Sanjay Marathe",
    image: paragImg,
    initials: "PM",
    role: "Founder • From Chaos to Change 🌌",
    tagline: "Someone trying to turn inner chaos into meaningful impact.",
    bio: "One of the founding minds behind Dhanvantara AI — shaping its long-term vision, product direction, and the belief that technology should never replace compassion, only amplify it.",
    accent: "from-amber-300 via-orange-300 to-rose-300",
    premium: true,
  },
];

function FounderCard({ founder, index }: { founder: FounderData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 8 });
  };

  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="[perspective:1200px]"
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 250ms cubic-bezier(0.22,1,0.36,1)",
        }}
        className="relative group"
      >
        <div
          className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-br ${founder.accent} opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500`}
        />

        <div className="relative glass rounded-[2rem] p-8 md:p-10 overflow-hidden">
          <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${founder.accent} opacity-30 blur-3xl`} />

          {founder.premium && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-accent/70"
                  style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
                  animate={{ y: [0, -14, 0], opacity: [0.2, 0.9, 0.2] }}
                  transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                />
              ))}
            </div>
          )}

          <div className="absolute top-6 right-6 flex items-center gap-2">
            {founder.premium && (
              <span className="text-[9px] tracking-[0.25em] px-2 py-0.5 rounded-full bg-gradient-gold text-foreground/90">FOUNDER</span>
            )}
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground">{founder.role.toUpperCase()}</span>
          </div>

          {/* Avatar */}
          <div className="relative mb-8">
            <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${founder.accent} opacity-40 blur-xl group-hover:opacity-80 transition-opacity duration-500`} />
            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/70 shadow-xl group-hover:scale-105 transition-transform duration-500">
              {founder.image ? (
                <img
                  src={founder.image}
                  alt={`${founder.name} — ${founder.role}`}
                  loading="lazy"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full grid place-items-center bg-gradient-to-br ${founder.accent}`}>
                  <span className="font-display text-4xl text-foreground/80">{founder.initials}</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-display text-3xl md:text-4xl leading-tight">{founder.name}</h3>
          <p className="mt-3 text-base italic text-gradient font-medium">"{founder.tagline}"</p>
          <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">{founder.bio}</p>

          <div className="mt-8 pt-6 border-t border-white/30 flex items-center justify-between">
            <span className="text-xs tracking-[0.25em] text-muted-foreground">DHANVANTARA AI</span>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Founder() {
  const { t } = useI18n();
  return (
    <section id="founders" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] text-primary mb-5">{t("founders.kicker")}</p>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
            {t("founders.title1")} <br />
            <span className="text-gradient italic">{t("founders.title2")}</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">{t("founders.subtitle")}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-8">
          {founders.map((f, i) => (
            <FounderCard key={f.name} founder={f} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative glass rounded-[2rem] p-10 md:p-14 text-center overflow-hidden"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-primary opacity-20 blur-3xl" />

          <div className="relative">
            <p className="text-xs tracking-[0.4em] text-primary mb-5">{t("founders.story.kicker")}</p>
            <p className="font-display text-2xl md:text-3xl leading-relaxed max-w-3xl mx-auto">{t("founders.story")}</p>

            <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-foreground/5 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium tracking-wide">{t("founders.vision")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
