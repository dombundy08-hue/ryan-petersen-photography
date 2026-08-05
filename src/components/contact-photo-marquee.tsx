"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import type { Photo } from "@/lib/shoots";

// A near-straight marquee line with a bigger, taller multi-turn spiral
// (~3.1 winds, radius 340 -> 22) dropped into the middle — generated
// point-by-point rather than hand-guessed, see scratchpad/gen_spiral2.py.
// Total path length ~6069 units; with 40 unique photos x repeat=2 (80
// items), spacing works out to ~76 units — close to the ~64-80px tile
// size, so items read as a near-continuous chain along the path.
const PATH =
  "M -150.0 480.0 L 930.0 480.0 L 990.0 480.0 L 987.2 509.9 L 981.8 539.4 " +
  "L 973.9 568.1 L 963.5 595.9 L 950.7 622.5 L 935.7 647.8 L 918.5 671.6 " +
  "L 899.4 693.7 L 878.6 713.8 L 856.1 732.0 L 832.2 748.1 L 807.1 761.9 " +
  "L 780.9 773.3 L 754.0 782.4 L 726.5 789.0 L 698.7 793.1 L 670.7 794.7 " +
  "L 642.8 793.9 L 615.3 790.6 L 588.2 784.9 L 561.9 776.9 L 536.5 766.6 " +
  "L 512.3 754.1 L 489.4 739.6 L 467.9 723.3 L 448.1 705.1 L 430.0 685.4 " +
  "L 413.9 664.3 L 399.7 641.9 L 387.6 618.4 L 377.8 594.1 L 370.1 569.2 " +
  "L 364.7 543.8 L 361.7 518.1 L 360.9 492.4 L 362.3 466.8 L 366.1 441.7 " +
  "L 372.0 417.0 L 380.0 393.1 L 390.1 370.2 L 402.1 348.3 L 415.9 327.7 " +
  "L 431.4 308.5 L 448.5 290.8 L 467.0 274.8 L 486.7 260.6 L 507.5 248.2 " +
  "L 529.2 237.8 L 551.6 229.4 L 574.6 223.1 L 597.9 218.9 L 621.3 216.7 " +
  "L 644.7 216.7 L 667.9 218.7 L 690.8 222.7 L 713.0 228.7 L 734.5 236.6 " +
  "L 755.1 246.4 L 774.6 257.8 L 793.0 270.9 L 810.0 285.5 L 825.5 301.4 " +
  "L 839.5 318.6 L 851.9 336.8 L 862.5 356.0 L 871.3 375.9 L 878.3 396.3 " +
  "L 883.4 417.2 L 886.6 438.4 L 887.9 459.6 L 887.4 480.7 L 884.9 501.5 " +
  "L 880.7 522.0 L 874.7 541.8 L 867.0 560.9 L 857.7 579.2 L 846.9 596.4 " +
  "L 834.6 612.5 L 821.1 627.4 L 806.4 640.9 L 790.6 653.0 L 774.0 663.5 " +
  "L 756.5 672.5 L 738.5 679.9 L 720.0 685.5 L 701.3 689.5 L 682.3 691.8 " +
  "L 663.4 692.4 L 644.6 691.3 L 626.1 688.5 L 608.0 684.2 L 590.5 678.3 " +
  "L 573.8 670.9 L 557.8 662.1 L 542.9 652.1 L 528.9 640.8 L 516.2 628.3 " +
  "L 504.6 614.9 L 494.4 600.7 L 485.6 585.7 L 478.2 570.0 L 472.2 553.9 " +
  "L 467.7 537.5 L 464.8 520.8 L 463.3 504.1 L 463.4 487.5 L 464.9 471.0 " +
  "L 467.8 454.9 L 472.2 439.2 L 477.9 424.1 L 484.8 409.6 L 493.0 396.0 " +
  "L 502.2 383.2 L 512.5 371.4 L 523.7 360.7 L 535.7 351.1 L 548.4 342.6 " +
  "L 561.7 335.4 L 575.4 329.5 L 589.6 324.8 L 603.9 321.5 L 618.4 319.4 " +
  "L 632.9 318.7 L 647.2 319.3 L 661.4 321.1 L 675.1 324.1 L 688.5 328.4 " +
  "L 701.2 333.7 L 713.4 340.2 L 724.8 347.6 L 735.4 355.9 L 745.1 365.0 " +
  "L 753.9 374.9 L 761.7 385.5 L 768.4 396.5 L 774.1 408.1 L 778.6 419.9 " +
  "L 782.1 432.0 L 784.4 444.3 L 785.6 456.5 L 785.7 468.7 L 784.7 480.8 " +
  "L 782.7 492.5 L 779.7 504.0 L 775.6 514.9 L 770.7 525.4 L 764.9 535.3 " +
  "L 758.3 544.5 L 751.0 553.0 L 743.1 560.7 L 734.6 567.5 L 725.6 573.6 " +
  "L 716.2 578.7 L 706.6 582.9 L 696.7 586.2 L 686.6 588.5 L 676.6 589.9 " +
  "L 666.5 590.4 L 656.6 590.0 L 646.9 588.7 L 637.5 586.5 L 628.4 583.6 " +
  "L 619.7 579.9 L 611.6 575.5 L 603.9 570.4 L 596.9 564.8 L 590.5 558.6 " +
  "L 584.7 552.0 L 579.7 544.9 L 575.3 537.6 L 571.8 530.0 L 568.9 522.2 " +
  "L 566.9 514.3 L 565.5 506.4 L 564.9 498.5 L 565.1 490.7 L 565.9 483.1 " +
  "L 567.4 475.7 L 569.5 468.7 L 572.3 461.9 L 575.5 455.6 L 579.3 449.7 " +
  "L 583.5 444.2 L 588.2 439.3 L 593.2 434.9 L 598.4 431.0 L 603.9 427.7 " +
  "L 609.6 425.0 L 615.3 422.9 L 621.2 421.3 L 627.0 420.4 L 632.7 420.0 " +
  "L 638.4 420.1 L 643.9 420.7 L 649.2 421.9 L 654.2 423.5 L 659.0 425.5 " +
  "L 663.4 427.9 L 667.5 430.6 L 671.1 433.7 L 674.4 437.0 L 677.3 440.5 " +
  "L 679.8 444.2 L 681.8 448.0 L 683.4 451.9 L 684.6 455.8 L 685.3 459.6 " +
  "L 685.7 463.5 L 685.7 467.2 L 685.3 470.7 L 684.5 474.1 L 683.5 477.3 " +
  "L 682.1 480.3 L 680.5 483.0 L 678.7 485.4 L 676.7 487.5 L 674.6 489.3 " +
  "L 672.4 490.9 L 670.1 492.0 L 667.8 492.9 L 727.8 492.9 L 2050.0 520.0";

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
        viewBox="-150 0 2200 900"
        baseVelocity={reducedMotion ? 0 : 4}
        repeat={2}
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
