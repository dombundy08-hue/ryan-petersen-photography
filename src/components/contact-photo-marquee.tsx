"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import type { Photo } from "@/lib/shoots";

// A near-straight marquee line with a real multi-turn spiral (~2.75
// winds, radius 210 -> 18) dropped into the middle, generated point-by-
// point rather than hand-guessed — see scratchpad/gen_spiral.py.
const PATH =
  "M -100 420.0 L 820.0 420.0 L 860.0 420.0 L 857.0 445.7 L 851.0 470.6 " +
  "L 841.9 494.5 L 830.1 516.9 L 815.7 537.6 L 798.9 556.1 L 780.1 572.4 " +
  "L 759.6 586.1 L 737.8 597.1 L 714.8 605.3 L 691.2 610.5 L 667.3 612.8 " +
  "L 643.5 612.1 L 620.2 608.5 L 597.6 602.0 L 576.1 592.9 L 556.1 581.3 " +
  "L 537.7 567.4 L 521.4 551.5 L 507.3 533.8 L 495.5 514.7 L 486.3 494.4 " +
  "L 479.7 473.2 L 475.8 451.6 L 474.6 429.9 L 476.1 408.3 L 480.2 387.2 " +
  "L 486.8 367.0 L 495.8 347.9 L 507.0 330.2 L 520.2 314.1 L 535.2 299.9 " +
  "L 551.7 287.8 L 569.4 277.9 L 588.0 270.3 L 607.3 265.2 L 626.9 262.4 " +
  "L 646.5 262.2 L 665.8 264.3 L 684.5 268.7 L 702.4 275.4 L 719.2 284.2 " +
  "L 734.6 294.9 L 748.5 307.3 L 760.6 321.2 L 770.8 336.3 L 778.9 352.5 " +
  "L 785.0 369.3 L 788.9 386.7 L 790.5 404.2 L 790.0 421.6 L 787.4 438.6 " +
  "L 782.8 455.0 L 776.2 470.6 L 767.8 485.1 L 757.8 498.3 L 746.3 510.0 " +
  "L 733.6 520.1 L 719.9 528.5 L 705.4 535.1 L 690.4 539.7 L 675.1 542.4 " +
  "L 659.7 543.2 L 644.5 542.1 L 629.8 539.1 L 615.6 534.4 L 602.4 528.1 " +
  "L 590.1 520.2 L 579.1 511.0 L 569.4 500.6 L 561.2 489.2 L 554.5 477.1 " +
  "L 549.4 464.3 L 546.1 451.2 L 544.4 437.9 L 544.3 424.7 L 545.9 411.8 " +
  "L 549.1 399.3 L 553.7 387.5 L 559.6 376.5 L 566.8 366.4 L 575.1 357.5 " +
  "L 584.3 349.7 L 594.3 343.3 L 604.8 338.2 L 615.7 334.6 L 626.9 332.3 " +
  "L 638.0 331.5 L 649.0 332.1 L 659.7 334.0 L 669.9 337.2 L 679.5 341.5 " +
  "L 688.3 347.0 L 696.2 353.3 L 703.1 360.6 L 709.0 368.5 L 713.8 376.9 " +
  "L 717.4 385.7 L 719.8 394.7 L 721.0 403.8 L 721.1 412.8 L 720.1 421.6 " +
  "L 718.0 430.0 L 714.9 437.9 L 711.0 445.3 L 706.2 451.9 L 700.8 457.8 " +
  "L 694.7 462.8 L 688.3 466.9 L 681.5 470.1 L 674.5 472.3 L 667.4 473.6 " +
  "L 660.4 474.0 L 653.6 473.5 L 647.1 472.2 L 640.9 470.1 L 635.2 467.3 " +
  "L 630.1 463.9 L 625.5 459.9 L 621.7 455.5 L 618.5 450.8 L 616.0 445.9 " +
  "L 614.3 440.8 L 613.3 435.7 L 612.9 430.7 L 613.3 425.8 L 614.2 421.2 " +
  "L 615.7 416.9 L 617.7 413.0 L 620.1 409.5 L 622.8 406.5 L 625.8 404.0 " +
  "L 629.0 402.1 L 632.3 400.6 L 635.6 399.7 L 638.9 399.3 L 642.0 399.4 " +
  "L 644.9 399.9 L 647.6 400.8 L 650.0 402.0 L 690.0 402.0 L 1900 460";

export function ContactPhotoMarquee({ photos }: { photos: Photo[] }) {
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (photos.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-50"
      aria-hidden="true"
    >
      <MarqueeAlongSvgPath
        path={PATH}
        viewBox="0 0 1900 840"
        baseVelocity={reducedMotion ? 0 : 4}
        repeat={1}
        responsive
        className="h-full w-full scale-110"
      >
        {photos.map((photo, i) => (
          <div
            key={photo.src + i}
            className="h-16 w-16 overflow-hidden rounded-md sm:h-20 sm:w-20"
          >
            <Image
              src={photo.src}
              alt=""
              width={160}
              height={160}
              className="h-full w-full object-cover brightness-110 saturate-110"
            />
          </div>
        ))}
      </MarqueeAlongSvgPath>
    </div>
  );
}
