import { Mail, Phone, MapPin } from "lucide-react";
import logoImg from "../../imports/Lollipop1.png";
import { useI18n } from "../i18n";

export function Footer({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { messages, languages, currentLanguage, setLocale } = useI18n();
  const websiteLinks = [
    { key: "home", page: "home" },
    { key: "aboutUs", page: "about" },
    { key: "download", page: "download" },
    // { key: "contactUs", page: "contact" },
  ] as const;

  return (
    <footer className="bg-[#111] border-t border-white/5 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <img src={logoImg} alt="Lollipop" className="h-9 w-auto rounded-[8px]" />
          <span className="text-[#ffffff]" style={{ fontSize: "1.5rem", fontWeight: 800, fontStyle: "italic" }}>
            {messages.common.brand}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Contact Column */}
          <div className="mx-[5px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.footer.titles.contact}
            </h4>
            <div className="space-y-3.5">
              <p className="text-[#ffffff]" style={{ fontSize: "0.85rem", fontWeight: 700 }}>{messages.footer.titles.customerService}</p>
              <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>service@lollipop.im</span>
              </div>
              <p className="text-[#ffffff]" style={{ fontSize: "0.85rem", fontWeight: 700 }}>{messages.footer.titles.businessContact}</p>
              <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>business@lollipop.im</span>
              </div>
              {/* <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+852 9273 5725</span>
              </div> */}
              {/* <div className="flex items-start gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{messages.footer.address}</span>
              </div> */}
            </div>
          </div>

          {/* Website Column */}
          <div className="mx-[40px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.footer.titles.website}
            </h4>
            <ul className="space-y-3">
              {websiteLinks.map((item) => (
                <li key={item.key}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.page === "download") {
                        if (onNavigate) {
                          onNavigate("home");
                        }

                        setTimeout(() => {
                          const el = document.getElementById("download");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                          }
                        }, 100);
                        return;
                      }

                      if (onNavigate) {
                        onNavigate(item.page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {messages.footer.links[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="mx-[10px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.footer.titles.languages}
            </h4>
            <ul className="space-y-3">
              {languages.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => setLocale(item.code)}
                    className={`transition-colors ${currentLanguage.code === item.code ? "text-white" : "text-gray-400 hover:text-white"}`}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-6">
            {/* <a href="#" className="text-gray-500 hover:text-white transition-colors" style={{ fontSize: "0.8rem" }}>
              {messages.common.privacyPolicy}
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" style={{ fontSize: "0.8rem" }}>
              {messages.common.termsOfService}
            </a> */}
          </div>
          <p className="text-gray-600" style={{ fontSize: "0.75rem" }}>
            &copy; 2026 {messages.common.brand}. {messages.common.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
