"use client";

import Script from "next/script";

export function LiveChat() {
  return (
    <>
      <Script
        id="tawk-to-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6773c55daf5bfec1dbe512ad/1ige3ltsu';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();

            // Premium Tawk.to customization
            Tawk_API.onLoad = function(){
              Tawk_API.setAttributes({
                color : '#0d9488',
                backgroundColor : '#050c18',
                position : 'br'
              }, function(error){});
            };
          `,
        }}
      />
      <style>{`
        /* Premium Tawk.to Widget Styling */
        #tawk-bubble-container {
          z-index: 9999 !important;
        }
        .widget-visible {
          border-radius: 20px !important;
          overflow: hidden !important;
        }
      `}</style>
    </>
  );
}
