import { cn } from "@/lib/format";

/**
 * Wordmark "Luz Torres" — mono-tono, hereda el color del texto
 * (currentColor) mediante una máscara CSS sobre el SVG oficial.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Luz Torres"
      className={cn("block", className)}
      style={{
        aspectRatio: "1000 / 191.54",
        backgroundColor: "currentColor",
        WebkitMaskImage: "url(/luz-torres.svg)",
        maskImage: "url(/luz-torres.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}
