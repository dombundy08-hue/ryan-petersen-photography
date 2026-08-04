import { ImageResponse } from "next/og";

export const dynamic = "force-static";
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
          background:
            "linear-gradient(135deg, #100D0A 0%, #1B1712 60%, #2A241D 100%)",
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
            background: "#D3A054",
            marginBottom: 32,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
              stroke="#171310"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="13" r="3.5" stroke="#171310" strokeWidth="1.6" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#F3EDE3",
          }}
        >
          Ryan
          <span style={{ color: "#D3A054" }}>Shutter</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#B7AA98",
            marginTop: 20,
          }}
        >
          Senior · Family · Nature Photography
        </div>
      </div>
    ),
    { ...size }
  );
}
