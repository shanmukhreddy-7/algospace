export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path d="M32 5 57 49 45 56 32 33 19 56 7 49Z" fill="currentColor" />
      <path d="m32 5 0 28 13 23 12-7Z" fill="#8b77ef" />
      <path d="m22 43 10-6 10 6-10 6Z" fill="#78e4cd" />
    </svg>
  );
}
export function LogoScene() {
  return (
    <div className="logo-scene" aria-hidden="true">
      <div className="scene-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="logo-object">
        <div className="logo-depth">
          <Logo />
        </div>
        <Logo />
      </div>
      <span className="orbit-node node-one" />
      <span className="orbit-node node-two" />
      <span className="scene-caption">ORDER EMERGES FROM EXPLORATION</span>
    </div>
  );
}
