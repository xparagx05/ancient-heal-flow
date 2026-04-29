import { motion } from "framer-motion";
import { Star } from "lucide-react";

const doctors = [
  { name: "Dr. Aarav Sharma", spec: "Cardiologist", exp: "12 yrs", rating: 4.9, hue: "from-violet-300 to-blue-300", initials: "AS" },
  { name: "Dr. Priya Iyer", spec: "Dermatologist", exp: "9 yrs", rating: 4.8, hue: "from-rose-300 to-amber-200", initials: "PI" },
  { name: "Dr. Rohan Mehta", spec: "Neurologist", exp: "15 yrs", rating: 5.0, hue: "from-cyan-300 to-teal-300", initials: "RM" },
  { name: "Dr. Ananya Rao", spec: "Pediatrician", exp: "8 yrs", rating: 4.9, hue: "from-emerald-300 to-cyan-300", initials: "AR" },
];

export default function Doctors() {
  return (
    <section id="doctors" className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <p className="text-xs tracking-[0.3em] text-primary mb-4">— OUR HEALERS —</p>
            <h2 className="font-display text-5xl md:text-6xl max-w-xl leading-tight">
              Trusted doctors. <span className="text-gradient italic">Hand-picked.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">Every specialist verified, rated, and ready to care for you within the hour.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative glass rounded-3xl p-6 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_hsl(var(--primary)/0.4)] transition-all duration-500"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${d.hue} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`mx-auto w-28 h-28 rounded-full bg-gradient-to-br ${d.hue} grid place-items-center font-display text-3xl text-foreground/70 ring-4 ring-white/60 group-hover:scale-110 transition-transform duration-500`}>
                  {d.initials}
                </div>
                <div className="text-center mt-5">
                  <h4 className="font-display text-xl">{d.name}</h4>
                  <p className="text-sm text-muted-foreground">{d.spec}</p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3 h-3 fill-current" /> {d.rating}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">{d.exp}</span>
                  </div>
                  <button className="mt-5 w-full py-2.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium opacity-90 group-hover:opacity-100 hover:scale-[1.02] transition-all">
                    Book consult
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
