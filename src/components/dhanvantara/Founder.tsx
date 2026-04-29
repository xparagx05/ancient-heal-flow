import { motion } from "framer-motion";

export default function Founder() {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative glass rounded-[2.5rem] p-10 md:p-16 overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-gold opacity-20 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] text-primary mb-4">— FOUNDER'S NOTE —</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                "This is not just a project — it's a <span className="text-gradient italic">vision</span>."
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                We built Dhanvantara AI to honour 5,000 years of healing wisdom while
                wielding the most beautiful technology of our time. Every interaction
                is designed to feel calm, considered, human.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-300 to-blue-300 grid place-items-center font-display text-xl text-foreground/70 ring-4 ring-white">
                  AK
                </div>
                <div>
                  <div className="font-display text-lg">Aarya Kumar</div>
                  <div className="text-xs text-muted-foreground">Founder & CEO · Dhanvantara AI</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/30 via-secondary to-accent/30 grid place-items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
                <div className="font-display text-7xl md:text-8xl italic text-gradient relative z-10 leading-none text-center">
                  धन्व<br/>न्तरि
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-foreground/60 tracking-widest">
                  THE CELESTIAL PHYSICIAN
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
