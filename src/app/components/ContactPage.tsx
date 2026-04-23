import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Footer } from "./Footer";
import { useI18n } from "../i18n";

export function ContactPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { messages } = useI18n();
  const contactCards = [
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-white" />
        </div>
      ),
      title: messages.contact.cards[4].title,
      detail: "business@lollipop.im",
      isLink: false,
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-white" />
        </div>
      ),
      title: messages.contact.cards[5].title,
      detail: "service@lollipop.im",
      isLink: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0000]">
      {/* Hero Banner */}
      <div className="relative w-full" style={{ height: "520px" }}>
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1627330248289-cd404120b2bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBkYXJrJTIwb2ZmaWNlfGVufDF8fHx8MTc3NjY3MDI0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt={messages.contact.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 p-[0px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0000] to-transparent" />
        </div>

        {/* Title */}
        <div className="relative z-10 flex flex-col items-center justify-start pt-28">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-center"
            style={{ fontSize: "2.8rem", fontWeight: 800 }}
          >
            {messages.contact.title}
          </motion.h1>
        </div>

        {/* Cards */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 mt-16">
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            {contactCards.map((card, i) => (
              <motion.div
                key={card.detail}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300"
              >
                {card.icon}
                <h3 className="text-white mb-2" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  {card.title}
                </h3>
                {card.isLink ? (
                  <a
                    href="#"
                    className="text-gray-300 underline underline-offset-4 hover:text-white transition-colors"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {card.detail}
                  </a>
                ) : (
                  <p className="text-gray-300" style={{ fontSize: "0.9rem" }}>
                    {card.detail}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-40" />

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
