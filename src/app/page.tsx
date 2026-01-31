import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="bg-pattern" />

      <div className="container text-center z-10 px-4">
        <h1 className="text-4xl md:text-6xl mb-6 text-primary tracking-wider fade-in font-serif" style={{ animationDelay: '0.1s' }}>
          歴史的偉人診断
        </h1>

        <p className="text-lg md:text-xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed fade-in" style={{ animationDelay: '0.3s' }}>
          あなたの性格と才能を分析し、<br />
          魂が共鳴する歴史上の人物を見つけ出します。
        </p>

        <div className="fade-in" style={{ animationDelay: '0.6s' }}>
          <Link href="/diagnosis" className="btn-primary btn-gold text-lg px-12 py-4">
            診断を始める
          </Link>
        </div>
      </div>

      {/* Decorative localized circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[rgba(184,134,11,0.1)] pointer-events-none"
        style={{ animation: 'spin 60s linear infinite' }}
      />

      <style>{`
        @keyframes spin { 
          from { transform: translate(-50%, -50%) rotate(0deg); } 
          to { transform: translate(-50%, -50%) rotate(360deg); } 
        }
      `}</style>
    </main>
  );
}
