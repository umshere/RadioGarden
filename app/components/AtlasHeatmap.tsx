// TODO: AtlasHeatmap – placeholder thumbnail until globe is wired
export default function AtlasHeatmap() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="p-3 text-sm text-slate-300">Atlas Heatmap</div>
      <div className="aspect-[16/9] w-full bg-[url('/atlas-placeholder.jpg')] bg-center bg-cover" />
    </div>
  );
}

