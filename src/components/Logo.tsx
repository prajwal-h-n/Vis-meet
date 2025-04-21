
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
        <div className="absolute inset-0 flex items-center justify-center text-primary-foreground font-bold text-xl">
          Z
        </div>
      </div>
      <span className="font-bold text-xl">Zoom-Lite</span>
    </div>
  );
}
