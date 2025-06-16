"use client";
import React, { useEffect, useRef, useState } from "react";

interface TextScrambleProps {
  text: string;
  className?: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const TextScramble: React.FC<TextScrambleProps> = ({ text, className }) => {
  const [display, setDisplay] = useState("");
  const frame = useRef(0);

  useEffect(() => {
    let current = "";
    let progress = 0;
    function scramble() {
      if (progress < text.length) {
        current =
          text.slice(0, progress) +
          Array.from({ length: text.length - progress })
            .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
            .join("");
        setDisplay(current);
        progress++;
        frame.current = requestAnimationFrame(scramble);
      } else {
        setDisplay(text);
      }
    }
    frame.current = requestAnimationFrame(scramble);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className={className} aria-label={text} style={{ whiteSpace: "pre" }}>
      {display}
    </span>
  );
};

export default TextScramble;
