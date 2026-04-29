import { motion } from "framer-motion";
import { useRef, useState } from "react";

type FounderData = {
  name: string;
  initials: string;
  tagline: string;
  bio: string;
  accent: string;
  role: string;
};

const founders: FounderData[] = [
  {
    name: "Vaibhav Thite",
    initials: "VT",
    role: "Co-Founder",
    tagline: "Turning ideas into real-world digital solutions.",
    bio: "A driven BCA student focused on building practical digital systems with strong interest in web development, automation, and real-world problem solving.",
    accent: "from-violet-300 via-indigo-300 to-blue-300",
  },
  {
    name: "Rupali Singh",
    initials: "RS",
    role: "Co-Founder",
    tagline: "Designing experiences that are simple, functional, and impactful.",
    bio: "A web developer focused on clean UI/UX, responsive design, and improving user experience through real-world projects and collaboration.",
    accent: "from-rose-200 via-amber-200 to-violet-300",
  },
];

function FounderCard({ founder, index }: { founder: FounderData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 8 });
  };

  const reset = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={reset}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 250ms cubic-bezier(0.22,1,0.36,1)",
        }}
        className="relative group"
      >
        {/* Glow */}
        <div
          className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-br ${founder.accent} opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500`}
        />

        <div className="relative glass rounded-[2rem] p-8 md:p-10 overflow-hidden">
          {/* Decorative orbs */}
          <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${founder.accent} opacity-30 blur-3xl`} />
          <div className="absolute top-6 right-6 text-[10px] tracking-[0.3em] text-muted-foreground">
            {founder.role.toUpperCase()}
          </div>

          {/* Avatar */}
          <div className="relative mb-8">
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${founder.accent} grid place-items-center font-display text-3xl text-foreground/80 ring-4 ring-white/60 shadow-xl`}>
              {founder.initials}
            </div>
            <div
              className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${founder.accent} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10`}
              style={{ transform: hovered ? "translateZ(-20px)" : undefined }}
            />
          </div>

          {/* Content */}
          <h3 className="font-display text-3xl md:text-4xl leading-tight">
            {founder.name}
          </h3>
          <p className="mt-3 text-base italic text-gradient font-medium">
            "{founder.tagline}"
          </p>
          <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
            {founder.bio}
          </p>

          {/* Bottom line */}
          <div className="mt-8 pt-6 border-t border-white/30 flex items-center justify-between">
            <span className="text-xs tracking-[0.25em] text-muted-foreground">
              DHANVANTARA AI
            </span>
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
  return (
    <section id="founders" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] text-primary mb-5">— THE MINDS BEHIND —</p>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
            Built by founders who <br />
            <span className="text-gradient italic">believe in the vision.</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            Two builders, one shared mission — to reshape how India experiences healthcare.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          {founders.map((f, i) => (
            <FounderCard key={f.name} founder={f} index={i} />
          ))}
        </div>

        {/* Founder Story */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative glass rounded-[2rem] p-10 md:p-14 text-center overflow-hidden"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-primary opacity-20 blur-3xl" />

          <div className="relative">
            <p className="text-xs tracking-[0.4em] text-primary mb-5">— THE FOUNDER STORY —</p>
            <p className="font-display text-2xl md:text-3xl leading-relaxed max-w-3xl mx-auto">
              "Dhanvantara AI was born from a shared vision to combine{" "}
              <span className="text-gradient italic">healthcare and technology</span>{" "}
              in a meaningful way."
            </p>

            <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-foreground/5 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium tracking-wide">
                This is not just a project — it's the foundation of a future healthcare ecosystem.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
