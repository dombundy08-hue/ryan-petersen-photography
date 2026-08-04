import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAFAF9 0%, #F5F5F4 60%, #FED7AA 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#C2410C",
            marginBottom: 32,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
              stroke="#FFFFFF"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="13" r="3.5" stroke="#FFFFFF" strokeWidth="1.6" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#1C1917",
          }}
        >
          RP{" "}
          <span style={{ color: "#C2410C", marginLeft: 16 }}>
            Photography
          </span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#57534E", marginTop: 20 }}>
          Senior · Family · Nature Photography
        </div>
      </div>
    ),
    { ...size }
  );
}
