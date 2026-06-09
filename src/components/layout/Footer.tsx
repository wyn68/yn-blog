"use client";

import { useState, useEffect } from "react";
import LoadingLink from "@/components/LoadingLink";
import { Rss, Mail } from "lucide-react";
import { getSettings } from "@/services/settings";
import UptimeCounter from "./UptimeCounter";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data);
    });
  }, []);

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  const githubUrl = getSetting("social_github", "https://github.com/wyn68");
  const twitterUrl = getSetting("social_twitter", "https://twitter.com");
  const emailUrl = `mailto:${getSetting("social_email", "admin@ynpro.top")}`;

  const coreLinks = [
    { name: "首页", href: "/" },
    { name: "文章", href: "/posts" },
    { name: "关于", href: "/about" },
    { name: "隐私", href: "/privacy" },
  ];

  const socialLinks = [
    { icon: Rss, href: "/rss.xml", label: "RSS 订阅" },
    { icon: GithubIcon, href: githubUrl, label: "GitHub" },
    { icon: XIcon, href: twitterUrl, label: "X" },
    { icon: Mail, href: emailUrl, label: "邮箱联系" },
  ];

  return (
    <footer className="relative border-t border-border bg-background transition-all duration-500">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <LoadingLink href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-md transition-all duration-500 ease-out group-hover:scale-105">
                <span className="text-white font-bold text-lg tracking-tight">YN</span>
              </div>
            </LoadingLink>
            <p className="text-xs max-w-xs text-center md:text-left leading-relaxed text-muted-foreground">
              记录技术、设计与灵感
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <nav className="flex items-center gap-6">
              {coreLinks.map((link) => (
                <LoadingLink
                  key={link.name}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-500"
                >
                  {link.name}
                </LoadingLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-500 ease-out bg-muted border border-border hover:bg-accent hover:border-accent text-muted-foreground hover:text-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-[10px] text-center text-muted-foreground">
              © {currentYear} YN Blog. All rights reserved.
            </p>
            <span className="hidden sm:block text-muted-foreground">|</span>
            <UptimeCounter />
          </div>
        </div>
      </div>
    </footer>
  );
}
