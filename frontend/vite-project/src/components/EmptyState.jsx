export default function EmptyState({ emoji = "🌙", title, text, children }) {
  return (
    <div className="text-center py-16 fade-up">
      <p className="text-6xl mb-4">{emoji}</p>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {text && <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">{text}</p>}
      {children}
    </div>
  );
}
