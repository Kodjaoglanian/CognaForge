'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState('google-ai');
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // Here you would typically save the settings to a backend or localStorage
    // For now, it's just a mock save.
    toast({
      title: "Configurações Salvas (Simulação)",
      description: `Preferência de modelo "${selectedModel === 'google-ai' ? 'Google AI' : 'Ollama'}" foi selecionada (não funcional).`,
    });
  };

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
            A alteração para Ollama requer configuração local e modificações no Genkit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ai-model-select">Provedor de Modelo</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="ai-model-select">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-ai">Google AI (Padrão)</SelectItem>
                <SelectItem value="ollama">Ollama (Experimental)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedModel === 'ollama' && (
            <div className="p-4 bg-muted/50 border border-dashed border-primary/30 rounded-md flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-primary">Nota sobre Ollama:</h4>
                <p className="text-sm text-muted-foreground">
                  Para usar o Ollama, você precisa ter o Ollama instalado e rodando localmente com os modelos desejados.
                  Além disso, a configuração do Genkit (em <code>src/ai/genkit.ts</code>) precisará ser atualizada para usar o plugin do Ollama em vez do Google AI.
                  Esta opção é para fins demonstrativos e não altera automaticamente a configuração do backend.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled>
              Salvar Preferências (Em Breve)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            A funcionalidade completa de salvamento de configurações e troca dinâmica de modelos será implementada em atualizações futuras.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
