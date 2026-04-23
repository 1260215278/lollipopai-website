import { useState } from "react";
import { motion } from "motion/react";
import { Apple, Smartphone, Star, Mail, Check, Play, Download, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import bossPoster from "../../imports/Im-Obsessed-With-My-Boss-Part-II.png";
import qrCodeImg from "../../imports/短剧H5.png";
import { useI18n } from "../i18n";

export function DownloadCTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { messages } = useI18n();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); setTimeout(() => setSubscribed(false), 3000); }
  };

  return (
    <section id="download" className="relative py-28 overflow-hidden bg-[#080000]">
      {/* Animated background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-red-600/15 via-orange-600/10 to-red-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-5">
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {messages.downloadCta.eyebrow}
            </span>
          </span>
          <h2 className="text-white" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
            {messages.downloadCta.title}
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
            {messages.downloadCta.description}
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-5 gap-6 items-stretch">

          {/* Left card - Phone mockup + Download buttons */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-3 relative group"
          >
            <div className="relative rounded-3xl overflow-visible border border-white/5 bg-gradient-to-br from-red-950/30 via-black/60 to-orange-950/20 p-8 md:p-10 h-full">
              {/* Inner glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[80px] group-hover:bg-red-600/15 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Phone image */}
                <div className="relative flex-shrink-0">
                  <div className="w-48 h-80 md:w-56 md:h-96 rounded-[2rem] bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700 p-1.5 shadow-2xl shadow-red-900/20 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-20" />
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                      <ImageWithFallback
                        src={bossPoster}
                        alt="I'm Obsessed With My Boss Part II"
                        className="w-full h-full object-cover"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      {/* Bottom gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>{messages.downloadCta.featuredShowTitle}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-full h-0.5 rounded-full bg-white/20">
                            <div className="w-[65%] h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                          </div>
                          <span className="text-white/60 flex-shrink-0" style={{ fontSize: "0.55rem" }}>{messages.downloadCta.featuredTimer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating notification */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 right-[-1rem] z-30 bg-gradient-to-r from-red-500 to-orange-500 rounded-full px-3.5 py-1.5 shadow-lg shadow-red-900/40 whitespace-nowrap"
                  >
                    <span className="text-white" style={{ fontSize: "0.65rem", fontWeight: 700 }}>🎬 {messages.downloadCta.notification}</span>
                  </motion.div>
                </div>

                {/* Download content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-gray-400 ml-1.5" style={{ fontSize: "0.8rem" }}>{messages.downloadCta.rating}</span>
                  </div>
                  <h3 className="text-white mb-2" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 700, lineHeight: 1.3 }}>
                    {messages.downloadCta.featuredTitle}
                  </h3>
                  <p className="text-gray-400 mb-6" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>
                    {messages.downloadCta.featuredDescription}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <a href="https://h5.lollipop.im/" target="_blank" rel="noopener noreferrer" className="group/btn flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <Apple className="w-6 h-6" />
                      <div className="text-left">
                        <div style={{ fontSize: "0.55rem", lineHeight: 1, opacity: 0.6 }}>{messages.common.downloadOnThe}</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3 }}>{messages.common.appStore}</div>
                      </div>
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks" target="_blank" rel="noopener noreferrer" className="group/btn flex items-center gap-3 bg-white/10 text-white px-5 py-3 rounded-xl border border-white/10 hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <Smartphone className="w-6 h-6" />
                      <div className="text-left">
                        <div style={{ fontSize: "0.55rem", lineHeight: 1, opacity: 0.6 }}>{messages.common.getItOn}</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3 }}>{messages.common.googlePlay}</div>
                      </div>
                    </a>
                  </div>

                  <div className="flex items-center gap-4 justify-center md:justify-start text-gray-500" style={{ fontSize: "0.75rem" }}>
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-400" /> {messages.common.freeToDownload}</span>
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-400" /> {messages.common.noAdsInPremium}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - QR + Email stacked */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* QR Code card */}
            <div className="flex-1 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 flex flex-col items-center justify-center text-center hover:border-red-500/20 transition-all duration-500 group">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                  <ImageWithFallback src={qrCodeImg} alt="QR Code" className="w-28 h-28 object-contain" />
                </div>
              </div>
              <p className="text-white mb-1" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{messages.common.scanToDownload}</p>
              <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>{messages.common.pointCameraAtQr}</p>
            </div>

            {/* Email subscribe card */}
            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6 hover:border-red-500/20 transition-all duration-500">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{messages.common.stayUpdated}</p>
                  <p className="text-gray-500" style={{ fontSize: "0.7rem" }}>{messages.common.getReleaseAlerts}</p>
                </div>
              </div>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={messages.common.emailPlaceholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors min-w-0"
                  style={{ fontSize: "0.8rem" }}
                />
                <button type="submit" className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2.5 rounded-xl hover:from-red-400 hover:to-orange-400 transition-all flex-shrink-0 flex items-center gap-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {subscribed ? <Check className="w-4 h-4" /> : <><span>{messages.common.go}</span><ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </form>
              {subscribed && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 mt-2" style={{ fontSize: "0.75rem" }}>
                  ✓ {messages.common.subscribedSuccess}
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-14 pt-10 border-t border-white/5"
        >
          {messages.downloadCta.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                {stat.value}
              </div>
              <div className="text-gray-500" style={{ fontSize: "0.75rem" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
