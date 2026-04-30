import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useI18n } from "@/context/I18nContext";
import drAarav from "@/assets/doctor-aarav.jpg";
import drPriya from "@/assets/doctor-priya.jpg";
import drRohan from "@/assets/doctor-rohan.jpg";
import drAnanya from "@/assets/doctor-ananya.jpg";

const doctors = [
  { name: "Dr. Aarav Sharma", spec: "Cardiologist", exp: "12 yrs", rating: 4.9, image: drAarav, ring: "ring-blue-300/60", price: 799 },
  { name: "Dr. Priya Iyer", spec: "Dermatologist", exp: "9 yrs", rating: 4.8, image: drPriya, ring: "ring-rose-300/60", price: 599 },
  { name: "Dr. Rohan Mehta", spec: "Neurologist", exp: "15 yrs", rating: 5.0, image: drRohan, ring: "ring-teal-300/60", price: 999 },
  { name: "Dr. Ananya Rao", spec: "Pediatrician", exp: "8 yrs", rating: 4.9, image: drAnanya, ring: "ring-amber-300/60", price: 499 },
];

export default function Doctors() {
  const { openBooking } = useBooking();
  const { t } = useI18n();
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
            <p className="text-xs tracking-[0.3em] text-accent mb-4 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> {t("doctors.kicker")}
            </p>
            <h2 className="font-display text-5xl md:text-6xl max-w-xl leading-tight">
              {t("doctors.title1")} <span className="text-gradient-gold italic">{t("doctors.title2")}</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">{t("doctors.subtitle")}</p>
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
              <div className="relative">
                <div className="relative mx-auto w-28 h-28">
                  <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 opacity-50 blur-md group-hover:opacity-100 transition-opacity`} />
                  <div className={`relative w-28 h-28 rounded-full overflow-hidden ring-4 ${d.ring} ring-offset-2 ring-offset-background group-hover:scale-110 transition-transform duration-500`}>
                    <img
                      src={d.image}
                      alt={d.name}
                      loading="lazy"
                      width={224}
                      height={224}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                    {t("doctors.book")}
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
