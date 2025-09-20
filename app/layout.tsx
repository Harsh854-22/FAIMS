import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "MoneyWise - Master Your Money Like Never Before",
  description:
    "Transform your financial journey with AI-powered insights, gamified learning, and community support. The Duolingo for personal finance.",

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeWatermark() {
                  const selectors = [
                    '[data-v0-watermark]',
                    '.v0-watermark',
                    'div[style*="Built with v0"]',
                    'a[href*="v0.dev"]',
                    'div[class*="watermark"]',
                    '*[style*="position: fixed"][style*="bottom"]',
                    '*[style*="position: fixed"][style*="right"]',
                    '*[style*="z-index: 9999"]'
                  ];
                  
                  selectors.forEach(selector => {
                    try {
                      const elements = document.querySelectorAll(selector);
                      elements.forEach(el => {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        el.remove();
                      });
                    } catch (e) {}
                  });
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeWatermark);
                } else {
                  removeWatermark();
                }
                
                setInterval(removeWatermark, 500);
                const observer = new MutationObserver(removeWatermark);
                if (document.body) observer.observe(document.body, { childList: true, subtree: true });
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
