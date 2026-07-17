import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/context/I18nContext";
import vaibhavImg from "@/assets/founder-vaibhav.jpg";
import rupaliImg from "@/assets/founder-rupali.jpg";
import paragImg from "@/assets/founder-parag.jpg";

type FounderData = {
  name: string;
  first: string;
  last: string;
  image: string;
  role: string;
  label: string;
  tagline: string;
  bio: string;
  chips: string[];
  accent: string;      // tailwind gradient
  glow: string;        // hsl glow color
  index: string;       // 01 / 02 / 03
  variant: "hero" | "tall" | "wide";
  objectPos: string;   // CSS object-position — centers each face consistently
};

const founders: FounderData[] = [
  {
    name: "Parag Sanjay Marathe",
    first: "Parag",
    last: "Marathe",
    image: paragImg,
    role: "Founder",
    label: "VISIONARY",
    tagline: "From inner chaos to meaningful impact.",
    bio: "One of the founding minds behind Dhanvantara AI — shaping its long-term vision, product direction, and the belief that technology should never replace compassion, only amplify it.",
    chips: ["Vision", "Product", "Strategy", "Storytelling"],
    accent: "from-amber-300 via-orange-400 to-rose-400",
    glow: "42 95% 60%",
    index: "01",
    variant: "hero",
    objectPos: "center 20%",
  },
  {
    name: "Vaibhav Thite",
    first: "Vaibhav",
    last: "Thite",
    image: vaibhavImg,
    role: "Co-Founder",
    label: "BUILDER",
    tagline: "Turning ideas into real-world digital systems.",
    bio: "A driven BCA student focused on building practical digital systems with strong interest in web development, automation, and real-world problem solving.",
    chips: ["Engineering", "Automation", "Web"],
    accent: "from-indigo-400 via-blue-400 to-cyan-400",
    glow: "220 90% 60%",
    index: "02",
    variant: "tall",
    objectPos: "center 18%",
  },
  {
    name: "Rupali Singh",
    first: "Rupali",
    last: "Singh",
    image: rupaliImg,
    role: "Co-Founder",
    label: "DESIGNER",
    tagline: "Simple. Functional. Impactful.",
    bio: "A web developer focused on clean UI/UX, responsive design, and improving user experience through real-world projects and collaboration.",
    chips: ["Design", "UI/UX", "Frontend"],
    accent: "from-rose-300 via-fuchsia-400 to-violet-400",
    glow: "320 85% 65%",
    index: "03",
    variant: "wide",
    objectPos: "center 15%",
  },
];

/* ---------------- Particle field ---------------- */
function Particles({ glow, count = 14 }: { glow: string; count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 41) % 100}%`,
            top: `${(i * 67) % 100}%`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: `hsl(${glow} / 0.7)`,
            boxShadow: `0 0 10px hsl(${glow} / 0.9)`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ---------------- Floating chips ---------------- */
function Chips({ items, glow }: { items: string[]; glow: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c, i) => (
        <motion.span
          key={c}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
          whileHover={{ y: -3 }}
          className="relative px-3 py-1 rounded-full text-[11px] tracking-wider font-medium backdrop-blur-xl border border-white/30 bg-white/40 dark:bg-white/5"
          style={{ boxShadow: `0 4px 20px hsl(${glow} / 0.25)` }}
        >
          <span className="relative z-10">{c}</span>
          <span
            className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: `radial-gradient(circle at 50% 50%, hsl(${glow} / 0.25), transparent 70%)` }}
          />
        </motion.span>
      ))}
    </div>
  );
}

/* ---------------- Panel shell ---------------- */
function Panel({
  founder,
  className = "",
  children,
}: {
  founder: FounderData;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${className}`}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] opacity-40 group-hover:opacity-90 blur-3xl transition-opacity duration-700"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, hsl(${founder.glow} / 0.45), transparent 70%)` }}
      />
      {/* Gradient border */}
      <div className={`absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-br ${founder.accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
        <div className="w-full h-full rounded-[2rem] bg-background/70 backdrop-blur-2xl" />
      </div>
      {/* Content */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/10">
        <Particles glow={founder.glow} />
        {children}
      </div>
    </motion.div>
  );
}

/* ---------------- Hero (Parag) ---------------- */
function HeroPanel({ f }: { f: FounderData }) {
  return (
    <Panel founder={f} className="md:col-span-12 md:row-span-2 min-h-[520px]">
      <div className="grid md:grid-cols-5 gap-0 h-full">
        {/* Left: image overhang */}
        <div className="relative md:col-span-2 min-h-[380px] md:min-h-full overflow-visible">
          <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-30`} />
          <motion.img
            src={f.image}
            alt={f.name}
            loading="lazy"
            initial={{ scale: 1.05 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ objectPosition: f.objectPos }}
            className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/60" />

          {/* Floating label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="absolute top-6 left-6 px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/40 border border-white/20"
          >
            <span className="text-[10px] tracking-[0.35em] text-white/90">◆ {f.label}</span>
          </motion.div>

          <div className="absolute bottom-6 left-6 text-white/95 drop-shadow-lg">
            <p className="text-[10px] tracking-[0.4em] opacity-80">{f.index} / 03</p>
            <p className="font-display text-2xl leading-none mt-2">{f.first}</p>
          </div>
        </div>

        {/* Right: content */}
        <div className="relative md:col-span-3 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] tracking-[0.4em] text-primary">FOUNDER'S NOTE</span>
              <span className="text-[9px] tracking-[0.3em] px-2 py-0.5 rounded-full bg-gradient-gold text-foreground/90">FOUNDER</span>
            </div>

            <h3 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight">
              {f.first}
              <br />
              <span className="text-gradient italic">{f.last}</span>
            </h3>

            <p className="mt-6 text-base md:text-lg leading-relaxed text-foreground/80 max-w-md">
              "{f.tagline}"
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
              {f.bio}
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <Chips items={f.chips} glow={f.glow} />
            <div className="flex items-center gap-3 pt-4 border-t border-white/20">
              <div className="w-8 h-[1px] bg-gradient-to-r from-primary to-transparent" />
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground">DHANVANTARA · EST 2026</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------- Co-Founder card (shared component) ---------------- */
function CoFounderCard({ f }: { f: FounderData }) {
  return (
    <Panel founder={f} className="md:col-span-6 min-h-[560px]">
      <div className="relative h-full flex flex-col">
        {/* Image portion */}
        <div className="relative h-[300px] overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-40`} />
          <motion.img
            src={f.image}
            alt={f.name}
            loading="lazy"
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4 }}
            style={{ objectPosition: f.objectPos }}
            className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-[1200ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute top-5 right-5 px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/40 border border-white/20"
          >
            <span className="text-[10px] tracking-[0.35em] text-white/90">◆ {f.label}</span>
          </motion.div>

          <div className="absolute top-5 left-5">
            <span className="font-display text-6xl text-white/20 leading-none">{f.index}</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 p-8 -mt-4 flex flex-col">
          <p className="text-[10px] tracking-[0.4em] text-primary mb-3">{f.role.toUpperCase()}</p>
          <h3 className="font-display text-4xl leading-tight">
            {f.first} <span className="text-gradient italic">{f.last}</span>
          </h3>
          <p className="mt-4 text-sm italic text-foreground/70">"{f.tagline}"</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.bio}</p>
          <div className="mt-auto pt-6">
            <Chips items={f.chips} glow={f.glow} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function Founder() {
  const { t } = useI18n();

  return (
    <section id="founders" className="relative py-32 px-6 overflow-hidden">
      {/* Ambient background orbs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, hsl(42 95% 65% / 0.5), transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[8%] w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, hsl(220 90% 55% / 0.5), transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="container mx-auto max-w-7xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-gradient-to-r from-primary to-transparent" />
              <span className="text-xs tracking-[0.5em] text-primary">{t("founders.kicker")}</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
              The minds
              <br />
              <span className="text-gradient italic">behind the machine.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed md:text-right">
            Three protagonists. One belief — that healthcare should feel human, even when guided by intelligence.
          </p>
        </motion.div>

        {/* Asymmetric bento grid */}
        <div className="grid md:grid-cols-12 gap-6 md:gap-8">
          <HeroPanel f={founders[0]} />
          <CoFounderCard f={founders[1]} />
          <CoFounderCard f={founders[2]} />
        </div>

        {/* Founder's note strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-gold opacity-10 blur-3xl pointer-events-none" />
          <div className="relative rounded-[2rem] p-10 md:p-14 border border-white/20 backdrop-blur-xl bg-gradient-to-br from-white/50 to-white/10 dark:from-white/5 dark:to-white/[0.02] overflow-hidden">
            <div className="absolute top-6 right-8 text-[9px] tracking-[0.4em] text-muted-foreground">MANIFESTO / 001</div>
            <p className="text-[10px] tracking-[0.4em] text-primary mb-6">— FOUNDER'S NOTE</p>
            <p className="font-display text-3xl md:text-5xl leading-[1.1] max-w-4xl">
              "Technology should never <span className="italic text-gradient">replace</span> compassion.
              <br />
              It should <span className="italic text-gradient">amplify</span> it."
            </p>
            <div className="mt-10 flex items-center gap-4">
              <img src={paragImg} alt="Parag" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/40" />
              <div>
                <p className="text-sm font-semibold">Parag Sanjay Marathe</p>
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground">FOUNDER · DHANVANTARA AI</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
