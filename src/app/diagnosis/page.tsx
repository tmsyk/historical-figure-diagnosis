import DiagnosisForm from "@/components/DiagnosisForm";

export default function DiagnosisPage() {
    return (
        <main className="min-h-screen py-12 px-4 bg-background-soft relative">
            {/* Background Pattern */}
            <div className="bg-pattern" />

            <div className="container">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-serif text-primary mb-2">性格・才能診断</h1>
                    <p className="text-muted">直感で回答してください</p>
                </header>

                <DiagnosisForm />
            </div>
        </main>
    );
}
