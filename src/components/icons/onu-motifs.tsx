import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Ramoscelli d'ulivo stilizzati (pace) */
export function OliveBranchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 48c8-2 18-10 22-22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28 30c-4-6-2-12 2-16M32 34c-2-7 2-13 7-16M35 38c0-7 5-12 11-14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <ellipse
        cx="22"
        cy="22"
        rx="4"
        ry="7"
        transform="rotate(-35 22 22)"
        fill="currentColor"
        opacity="0.35"
      />
      <ellipse
        cx="30"
        cy="18"
        rx="4"
        ry="7"
        transform="rotate(-20 30 18)"
        fill="currentColor"
        opacity="0.45"
      />
      <ellipse
        cx="40"
        cy="20"
        rx="4"
        ry="7"
        transform="rotate(-5 40 20)"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

/** Mappamondo stilizzato */
export function GlobeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" />
      <ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="20"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 32h40M14 22h36M14 42h36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Rete di nodi (partnership / Goal 17) */
export function NetworkIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M18 20l14 8 14-10M32 28v16M18 44l14-8 14 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="18" cy="20" r="4" fill="currentColor" />
      <circle cx="46" cy="18" r="4" fill="currentColor" />
      <circle cx="32" cy="28" r="4.5" fill="currentColor" />
      <circle cx="18" cy="44" r="4" fill="currentColor" />
      <circle cx="46" cy="42" r="4" fill="currentColor" />
      <circle cx="32" cy="44" r="3.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/** Bilancia (giustizia / Goal 16) */
export function ScalesIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M32 12v36M20 48h24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 22h32M16 22l-6 14h12L16 22zm32 0l-6 14h12L48 22z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
