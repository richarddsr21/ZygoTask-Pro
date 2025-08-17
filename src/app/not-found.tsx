import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Ops! A página que você está procurando não existe ou foi movida.
            Verifique o endereço ou navegue para uma das páginas principais.
          </p>
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 cursor-pointer">
                <Home className="w-4 h-4 mr-2" />
                Ir para Início
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full py-3 bg-transparent cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="flex flex-col text-sm text-gray-500">
              <span className="font-semibold text-blue-600">TaskFlow Pro</span>
              Gerencie suas tarefas de forma inteligente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
