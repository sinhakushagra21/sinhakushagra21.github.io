"use client";

import { useState } from "react";

// Google Noto emoji CDN — high-res, colorful, animated where available.
// Maps our emoji glyphs to their codepoint folder.
const CP: Record<string, string> = {
  "👨🏻‍💻": "1f468_200d_1f4bb",
  "👨‍💻": "1f468_200d_1f4bb",
  "👔": "1f454",
  "💼": "1f4bc",
  "🚀": "1f680",
  "🛠️": "1f6e0_fe0f",
  "🛠": "1f6e0_fe0f",
  "🎓": "1f393",
  "📇": "1f4c7",
};

export default function WAAvatar({
  emoji,
  bg,
  size = 49,
}: {
  emoji: string;
  bg: string;
  size?: number;
}) {
  const cp = CP[emoji];
  const [ext, setExt] = useState<"gif" | "png">("gif");

  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-full overflow-hidden"
      style={{ width: size, height: size, background: bg }}
    >
      {cp ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${cp}/512.${ext}`}
          alt=""
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          onError={() => ext === "gif" && setExt("png")}
          style={{ display: "block" }}
        />
      ) : (
        <span style={{ fontSize: size * 0.44 }}>{emoji}</span>
      )}
    </div>
  );
}
