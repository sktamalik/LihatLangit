export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef5fc] px-4">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted font-geist text-sm">Memuat LihatLangit...</p>
      </div>
    </div>
  );
}
