export default function Spinner({ size = "md" }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-4" };
  return (
    <div className={`${sizes[size]} border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin shadow-[0_0_12px_rgba(0,255,136,0.5)]`} />
  );
}
