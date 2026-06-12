import { ImageResponse } from "next/og";

/**
 * Branded 1200x630 social card, generated at the edge.
 * Used for og:image / twitter:image site-wide — links shared on WhatsApp,
 * LinkedIn, X, Slack etc. show this card instead of a cropped logo.
 */
export const runtime = "edge";
export const alt = "AUMOXO — AI Solutions, CRM Platforms & Custom Software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#000000",
          color: "#fafafa",
          padding: "80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* gold top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "8px",
            background: "linear-gradient(90deg, #F0DDA0, #D4AF37, #B8941F)",
          }}
        />
        {/* subtle glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "26px",
            letterSpacing: "10px",
            color: "#D4AF37",
            textTransform: "uppercase",
          }}
        >
          Think Infinite
        </div>
        <div
          style={{
            marginTop: "20px",
            fontSize: "110px",
            fontWeight: 700,
            letterSpacing: "18px",
            display: "flex",
          }}
        >
          AUMOXO
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "34px",
            fontWeight: 300,
            color: "#d4d4d8",
            display: "flex",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          AI Solutions · CRM Platforms · Business Automation · Enterprise
          Software
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            fontSize: "28px",
            color: "#D4AF37",
            display: "flex",
          }}
        >
          aumoxo.tech
        </div>
      </div>
    ),
    { ...size }
  );
}
