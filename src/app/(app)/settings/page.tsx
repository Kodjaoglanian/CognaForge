
'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState('google-ai');

  return (
    <div>
      <PageTitle
        title="Configurações"
        description="Gerencie suas preferências e configurações do aplicativo."
      />

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Preferências de Modelo de IA</CardTitle>
          <CardDescription>
            Escolha o provedor de modelo de IA para as funcionalidades generativas.
            Atualmente, o aplicativo está configurado para usar Google AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ai-model-select">Provedor de Modelo Configurado</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled>
              <SelectTrigger id="ai-model-select">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-ai">Google AI (Padrão)</SelectItem>
                {/* Ollama option removed as the package @genkit-ai/ollama was not found */}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted/50 border border-dashed border-primary/30 rounded-md flex items-start space-x-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-primary">Como Mudar o Provedor de IA:</h4>
              <p className="text-sm text-muted-foreground">
                Para efetivamente trocar o modelo de IA (ex: para um provedor diferente no futuro, quando disponível e compatível):
              </p>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-2">
                <li>Instale o pacote do plugin Genkit para o provedor desejado (ex: <code>npm install @genkit-ai/some-provider</code>).</li>
                <li>
                  Abra o arquivo <code>src/ai/genkit.ts</code> no seu editor de código.
                </li>
                <li>
                  Siga as instruções nos comentários dentro daquele arquivo para importar e configurar o plugin do provedor escolhido.
                </li>
                <li>
                  Certifique-se de que o serviço do provedor (ex: um servidor local, se aplicável) esteja rodando.
                </li>
                <li>
                  Após editar <code>src/ai/genkit.ts</code>, reinicie o servidor de desenvolvimento do Genkit (geralmente <code>npm run genkit:dev</code> ou <code>npm run genkit:watch</code>).
                </li>
                <li>
                  Reinicie também o servidor de desenvolvimento do Next.js (<code>npm run dev</code>).
                </li>
              </ol>
               <p className="text-sm text-muted-foreground mt-2">
                Nota: A opção de usar <code>@genkit-ai/ollama</code> foi removida temporariamente pois o pacote não pôde ser instalado (erro 404 no registro NPM).
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button disabled>
              Salvar Preferências (Ação Manual Necessária)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            A troca efetiva de modelos de IA requer edição de código e reinicialização dos servidores, conforme instruções acima.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
