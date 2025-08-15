import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotepadText, Clock5 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
              ZygoTask
              <span className="block text-blue-600">Pro</span>
            </h1>
            <div className="w-20 h-1 bg-blue-600 rounded-full ml-1" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-slate-800">
              Mantenha-se organizado.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Um aplicativo de tarefas moderno e intuitivo, projetado para
              produtividade. Organize tarefas, defina prazos e acompanhe o
              progresso com uma interface limpa que não atrapalha seu fluxo de
              trabalho.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
              >
                <Link href="/register">Começar</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg font-medium bg-transparent"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-200">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <NotepadText className="text-blue-600" size={16} />
              </div>
              <h3 className="font-semibold text-slate-800">
                Organização Inteligente
              </h3>
              <p className="text-sm text-slate-600">
                Agrupe tarefas por projetos e prioridades
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock5 className="text-blue-600" size={16} />
              </div>
              <h3 className="font-semibold text-slate-800">
                Controle de Prazos
              </h3>
              <p className="text-sm text-slate-600">
                Nunca perca prazos importantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
