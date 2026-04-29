import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const doctors = [
  { name: "Dr. Aarav Sharma", spec: "Cardiologist", exp: "12 yrs", rating: 4.9, hue: "from-accent/40 to-primary/30", initials: "AS", price: 799 },
  { name: "Dr. Priya Iyer", spec: "Dermatologist", exp: "9 yrs", rating: 4.8, hue: "from-accent/50 to-accent/20", initials: "PI", price: 599 },
  { name: "Dr. Rohan Mehta", spec: "Neurologist", exp: "15 yrs", rating: 5.0, hue: "from-primary/40 to-accent/30", initials: "RM", price: 999 },
  { name: "Dr. Ananya Rao", spec: "Pediatrician", exp: "8 yrs", rating: 4.9, hue: "from-accent/40 to-primary/40", initials: "AR", price: 499 },
];

export default function Doctors() {
  const { openBooking } = useBooking();
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
            <p className="text-xs tracking-[0.3em] text-accent mb-4 inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> OUR HEALERS</p>
            <h2 className="font-display text-5xl md:text-6xl max-w-xl leading-tight">
              Trusted doctors. <span className="text-gradient-gold italic">Hand-picked.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">Every specialist verified, rated, and ready to care for you within the hour.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((d, i) => (
            <motion.button
              key={d.name}
              type="button"
              onClick={() => openBooking({ name: d.name, specialty: d.spec, price: d.price })}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10, rotateX: 4, rotateY: -4 }}
              className="group relative glass rounded-3xl p-6 text-left hover:shadow-[0_30px_60px_-20px_hsl(var(--accent)/0.5)] transition-all duration-500 cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${d.hue} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`mx-auto w-28 h-28 rounded-full bg-gradient-to-br ${d.hue} grid place-items-center font-display text-3xl text-foreground ring-4 ring-background group-hover:scale-110 transition-transform duration-500`}>
                  {d.initials}
                </div>
                <div className="text-center mt-5">
                  <h4 className="font-display text-xl">{d.name}</h4>
                  <p className="text-sm text-muted-foreground">{d.spec}</p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-accent">
                      <Star className="w-3 h-3 fill-current" /> {d.rating}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">{d.exp}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">₹{d.price}</span>
                  </div>
                  <div className="ripple mt-5 w-full py-2.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all">
                    Book consult
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
