'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Save, RefreshCw, Moon, Sun, Monitor, RotateCcw, AlertTriangle } from 'lucide-react';

// Simplified toast function
const toast = {
  success: (message: string) => {
    console.log('Success:', message);
    alert(message); // Fallback to native alert
  },
  error: (message: string) => {
    console.error('Error:', message);
    alert(`Erro: ${message}`); // Fallback to native alert
  }
};

// Type definition for our settings
type AppSettingsType = {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  aiPreferences: {
    responseLength: 'concise' | 'balanced' | 'detailed';
    creativity: number;
    formatCode: boolean;
    includeSources: boolean;
    defaultModel: string;
  };
  socraticMode: {
    questionDifficulty: 'beginner' | 'intermediate' | 'advanced';
    includeAnalysis: boolean;
    questionsPerTopic: number;
  };
  knowledgeBuilder: {
    autoSuggestConnections: boolean;
    includeVisualElements: boolean;
    detailLevel: 'basic' | 'standard' | 'comprehensive';
  };
  accessibility: {
    screenReader: boolean;
    largeText: boolean;
    keyboardNavigation: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    studyReminders: boolean;
  };
};

// Default values for settings
const defaultSettings: AppSettingsType = {
  appearance: {
    theme: 'system',
    fontSize: 16,
    reducedMotion: false,
    highContrast: false,
  },
  aiPreferences: {
    responseLength: 'balanced',
    creativity: 50,
    formatCode: true,
    includeSources: true,
    defaultModel: 'llama3.2:3b',
  },
  socraticMode: {
    questionDifficulty: 'intermediate',
    includeAnalysis: true,
    questionsPerTopic: 5,
  },
  knowledgeBuilder: {
    autoSuggestConnections: true,
    includeVisualElements: true,
    detailLevel: 'standard',
  },
  accessibility: {
    screenReader: false,
    largeText: false,
    keyboardNavigation: true,
  },
  notifications: {
    enabled: true,
    sound: true,
    desktop: false,
    studyReminders: false,
  },
};

// Simple useLocalStorage hook implementation
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export function AppSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettingsType>('cognaforge-settings', defaultSettings);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Atualiza um valor específico nas configurações
  const updateSetting = <T extends keyof AppSettingsType>(
    category: T,
    setting: keyof AppSettingsType[T],
    value: any
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value,
      },
    });
    setUnsavedChanges(true);
  };

  // Aplica o tema selecionado
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = settings.appearance;
      const root = window.document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme();
    
    // Escuta mudanças no tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.appearance.theme === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.appearance.theme]);

  // Aplica tamanho de fonte
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${settings.appearance.fontSize}px`);
  }, [settings.appearance.fontSize]);

  // Aplica acessibilidade
  useEffect(() => {
    if (settings.accessibility.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    
    if (settings.appearance.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    if (settings.appearance.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [
    settings.accessibility.largeText,
    settings.appearance.reducedMotion,
    settings.appearance.highContrast
  ]);

  // Resetar para valores padrão
  const resetToDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
      setSettings(defaultSettings);
      toast.success('Configurações restauradas para os valores padrão');
    }
  };

  // Salvar mudanças
  const saveChanges = () => {
    // Em uma aplicação real, aqui poderíamos salvar as configurações no backend
    setUnsavedChanges(false);
    toast.success('Configurações salvas com sucesso');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Configurações</h1>
          <p className="text-muted-foreground">Personalize o CognaForge de acordo com suas preferências</p>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Button onClick={saveChanges} className="flex items-center gap-2">
              <Save size={16} />
              Salvar Alterações
            </Button>
          )}
          <Button variant="outline" onClick={resetToDefaults} className="flex items-center gap-2">
            <RotateCcw size={16} />
            Restaurar Padrões
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="ai">IA & Modelos</TabsTrigger>
          <TabsTrigger value="socratic">Modo Socrático</TabsTrigger>
          <TabsTrigger value="knowledge">Construção de Conhecimento</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tema e Aparência</CardTitle>
              <CardDescription>Ajuste a aparência visual do CognaForge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-4">
                  <Button
                    variant={settings.appearance.theme === 'light' ? 'default' : 'outline'}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => updateSetting('appearance', 'theme', 'light')}
                  >
                    <Sun size={16} /> Claro
                  </Button>
                  <Button
                    variant={settings.appearance.theme === 'dark' ? 'default' : 'outline'}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => updateSetting('appearance', 'theme', 'dark')}
                  >
                    <Moon size={16} /> Escuro
                  </Button>
                  <Button
                    variant={settings.appearance.theme === 'system' ? 'default' : 'outline'}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => updateSetting('appearance', 'theme', 'system')}
                  >
                    <Monitor size={16} /> Sistema
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tamanho da Fonte</Label>
                  <span className="text-sm text-muted-foreground">{settings.appearance.fontSize}px</span>
                </div>
                <Slider
                  value={[settings.appearance.fontSize]}
                  min={12}
                  max={24}
                  step={1}
                  onValueChange={(value) => updateSetting('appearance', 'fontSize', value[0])}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reducedMotion">Reduzir Animações</Label>
                  <p className="text-sm text-muted-foreground">Desabilitar animações e transições</p>
                </div>
                <Switch
                  id="reducedMotion"
                  checked={settings.appearance.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('appearance', 'reducedMotion', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="highContrast">Alto Contraste</Label>
                  <p className="text-sm text-muted-foreground">Aumentar o contraste para melhor legibilidade</p>
                  <span className="text-xs text-amber-600 italic">Funcionalidade em desenvolvimento</span>
                </div>
                <Switch
                  id="highContrast"
                  checked={settings.appearance.highContrast}
                  onCheckedChange={(checked) => updateSetting('appearance', 'highContrast', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA & Modelos */}
        <TabsContent value="ai" className="space-y-4">
          <Alert variant="destructive" className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-600 dark:text-amber-400">Atenção: Configurações Experimentais</AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              Modificar estas configurações pode afetar o funcionamento e qualidade das respostas da IA. 
              Algumas opções podem exigir o reinício da aplicação para ter efeito.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Preferências de IA</CardTitle>
              <CardDescription>Ajuste como a IA interage e responde às suas solicitações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Extensão das Respostas</Label>
                <Select
                  value={settings.aiPreferences.responseLength}
                  onValueChange={(value: any) => updateSetting('aiPreferences', 'responseLength', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a extensão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concisa</SelectItem>
                    <SelectItem value="balanced">Equilibrada</SelectItem>
                    <SelectItem value="detailed">Detalhada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Criatividade</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.aiPreferences.creativity < 33 ? 'Conservadora' : 
                     settings.aiPreferences.creativity < 66 ? 'Equilibrada' : 'Criativa'}
                  </span>
                </div>
                <Slider
                  value={[settings.aiPreferences.creativity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => updateSetting('aiPreferences', 'creativity', value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Mais preciso</span>
                  <span>Mais criativo</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modelo Padrão</Label>
                <Select
                  value={settings.aiPreferences.defaultModel}
                  onValueChange={(value) => updateSetting('aiPreferences', 'defaultModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama3.2:3b">Llama 3.2 (3B)</SelectItem>
                    <SelectItem value="llama3.2:8b">Llama 3.2 (8B)</SelectItem>
                    <SelectItem value="llama3.2:70b">Llama 3.2 (70B)</SelectItem>
                    <SelectItem value="mistral:7b">Mistral (7B)</SelectItem>
                    <SelectItem value="mistral:8x7b">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="formatCode">Formatar Código</Label>
                  <p className="text-sm text-muted-foreground">Aplicar formatação em blocos de código</p>
                </div>
                <Switch
                  id="formatCode"
                  checked={settings.aiPreferences.formatCode}
                  onCheckedChange={(checked) => updateSetting('aiPreferences', 'formatCode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="includeSources">Incluir Fontes</Label>
                  <p className="text-sm text-muted-foreground">Solicitar referências nas respostas da IA</p>
                </div>
                <Switch
                  id="includeSources"
                  checked={settings.aiPreferences.includeSources}
                  onCheckedChange={(checked) => updateSetting('aiPreferences', 'includeSources', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modo Socrático */}
        <TabsContent value="socratic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Modo Socrático</CardTitle>
              <CardDescription>Personalize como o diálogo socrático é conduzido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Dificuldade das Perguntas</Label>
                <Select
                  value={settings.socraticMode.questionDifficulty}
                  onValueChange={(value: any) => updateSetting('socraticMode', 'questionDifficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Perguntas por Tópico</Label>
                  <span className="text-sm text-muted-foreground">{settings.socraticMode.questionsPerTopic}</span>
                </div>
                <Slider
                  value={[settings.socraticMode.questionsPerTopic]}
                  min={3}
                  max={15}
                  step={1}
                  onValueChange={(value) => updateSetting('socraticMode', 'questionsPerTopic', value[0])}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="includeAnalysis">Incluir Análise</Label>
                  <p className="text-sm text-muted-foreground">Mostrar análise da IA sobre suas respostas</p>
                </div>
                <Switch
                  id="includeAnalysis"
                  checked={settings.socraticMode.includeAnalysis}
                  onCheckedChange={(checked) => updateSetting('socraticMode', 'includeAnalysis', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outros tabs... */}
        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Construção de Conhecimento</CardTitle>
              <CardDescription>Configure como os mapas mentais e anotações são gerados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Conteúdo do tab */}
              <div className="space-y-2">
                <Label>Nível de Detalhamento</Label>
                <Select
                  value={settings.knowledgeBuilder.detailLevel}
                  onValueChange={(value: any) => updateSetting('knowledgeBuilder', 'detailLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de detalhamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="comprehensive">Abrangente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Mais opções... */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSuggestConnections">Sugerir Conexões</Label>
                  <p className="text-sm text-muted-foreground">Sugerir automaticamente conexões entre conceitos</p>
                </div>
                <Switch
                  id="autoSuggestConnections"
                  checked={settings.knowledgeBuilder.autoSuggestConnections}
                  onCheckedChange={(checked) => updateSetting('knowledgeBuilder', 'autoSuggestConnections', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility" className="space-y-4">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Recursos em desenvolvimento</AlertTitle>
            <AlertDescription>
              Algumas funcionalidades de acessibilidade estão em fase de implementação e podem não funcionar completamente.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Acessibilidade</CardTitle>
              <CardDescription>Ajuste as configurações de acessibilidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="screenReader">Otimizado para Leitor de Tela</Label>
                  <p className="text-sm text-muted-foreground">Melhorar compatibilidade com leitores de tela</p>
                  <span className="text-xs text-amber-600 italic">Funcionalidade em desenvolvimento</span>
                </div>
                <Switch
                  id="screenReader"
                  checked={settings.accessibility.screenReader}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'screenReader', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="largeText">Texto Grande</Label>
                  <p className="text-sm text-muted-foreground">Aumentar tamanho do texto em toda a interface</p>
                  <span className="text-xs text-amber-600 italic">Funcionalidade em desenvolvimento</span>
                </div>
                <Switch
                  id="largeText"
                  checked={settings.accessibility.largeText}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'largeText', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="keyboardNavigation">Navegação por Teclado</Label>
                  <p className="text-sm text-muted-foreground">Melhorar suporte para navegação por teclado</p>
                </div>
                <Switch
                  id="keyboardNavigation"
                  checked={settings.accessibility.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'keyboardNavigation', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sistema de notificações limitado</AlertTitle>
            <AlertDescription>
              O sistema de notificações está em fase inicial. Algumas opções como sons ainda não estão disponíveis.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure quando e como receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificationsEnabled">Notificações</Label>
                  <p className="text-sm text-muted-foreground">Habilitar todas as notificações</p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) => updateSetting('notifications', 'enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between opacity-50">
                <div>
                  <Label htmlFor="soundNotifications">Sons</Label>
                  <p className="text-sm text-muted-foreground">Reproduzir sons para notificações</p>
                  <span className="text-xs text-amber-600 italic">Recurso não disponível</span>
                </div>
                <Switch
                  id="soundNotifications"
                  disabled={true}
                  checked={false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="desktopNotifications">Notificações Desktop</Label>
                  <p className="text-sm text-muted-foreground">Mostrar notificações do sistema</p>
                </div>
                <Switch
                  id="desktopNotifications"
                  disabled={!settings.notifications.enabled}
                  checked={settings.notifications.desktop && settings.notifications.enabled}
                  onCheckedChange={(checked) => updateSetting('notifications', 'desktop', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="studyReminders">Lembretes de Estudo</Label>
                  <p className="text-sm text-muted-foreground">Receber lembretes para sessões de estudo</p>
                </div>
                <Switch
                  id="studyReminders"
                  disabled={!settings.notifications.enabled}
                  checked={settings.notifications.studyReminders && settings.notifications.enabled}
                  onCheckedChange={(checked) => updateSetting('notifications', 'studyReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
