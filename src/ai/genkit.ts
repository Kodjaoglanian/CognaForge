import { generateFromOllama, streamFromOllama, isOllamaAvailable } from './ollama-client';

/**
 * Adaptador para usar Ollama local como alternativa ao Genkit com Google AI.
 * 
 * Esta implementação substitui a dependência do Google AI, removendo a necessidade
 * de uma chave de API do Google. Ao invés disso, usa o Ollama localmente.
 * 
 * Requisitos:
 * 1. Ollama instalado e rodando localmente: https://ollama.ai/download
 * 2. Modelos necessários baixados (ex: `ollama pull llama3.2:3b`)
 * 
 * Esta interface simula a API do Genkit para manter compatibilidade com o código existente.
 */

// Modelo padrão do Ollama a ser usado
const DEFAULT_MODEL = 'llama3.2:3b';

// Simula a interface do Genkit com implementação baseada no Ollama
export const ai = {
  // Gera texto usando Ollama
  generateText: async (prompt: string, options: any = {}) => {
    const model = options.model || DEFAULT_MODEL;
    try {
      return {
        text: await generateFromOllama(prompt, model),
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      };
    } catch (error) {
      console.error('Erro ao gerar texto com Ollama:', error);
      throw error;
    }
  },

  // Versão com streaming que emula a interface do Genkit
  streamText: async (prompt: string, options: any = {}) => {
    const model = options.model || DEFAULT_MODEL;
    const { onStream } = options;
    
    try {
      // Se não houver callback de stream, use a versão não-streaming
      if (!onStream) {
        const text = await generateFromOllama(prompt, model);
        return { text };
      }
      
      // Inicia o streaming
      let fullText = '';
      
      // Função para receber tokens do streaming
      const handleToken = (token: string) => {
        fullText += token;
        onStream({ text: token, fullText });
      };
      
      // Inicia o streaming de fato
      await streamFromOllama(prompt, handleToken, model);
      
      return { text: fullText };
    } catch (error) {
      console.error('Erro ao streamar texto com Ollama:', error);
      throw error;
    }
  },

  // Verificação de disponibilidade do serviço
  isAvailable: async () => {
    return await isOllamaAvailable();
  },

  // Implementação do método definePrompt que estava faltando
  definePrompt: (config: any) => {
    // Preserva a configuração original para referência
    const promptConfig = { ...config };
    
    // Cria o objeto prompt primeiro
    const promptObject = {
      // Expõe a configuração original
      config: promptConfig,
      
      // Função para executar o prompt com os parâmetros de entrada
      generate: async (input: any, options: any = {}) => {
        try {
          // Constrói o prompt baseado no input e na configuração
          let promptText = `${config.name}:\n`;
          
          // Adiciona os dados de entrada formatados
          promptText += `Input: ${JSON.stringify(input, null, 2)}\n`;
          
          // Adiciona instruções específicas para gerar JSON válido
          if (config.output?.schema) {
            // Simplifica a descrição do schema para ser mais compreensível para o modelo
            const schemaDescription: Record<string, string> = {};
            try {
              const fullSchema = config.output.schema.describe();
              // Extrai apenas os nomes e descrições dos campos
              if (fullSchema.shape) {
                Object.keys(fullSchema.shape).forEach(key => {
                  schemaDescription[key] = fullSchema.shape[key].description || 'string';
                });
              }
            } catch (e) {
              console.warn("Erro ao extrair descrição do schema:", e);
            }
            
            // Instruções claras com exemplo
            promptText += `\nSAÍDA ESPERADA: Um objeto JSON com os seguintes campos:\n`;
            Object.entries(schemaDescription).forEach(([key, desc]) => {
              promptText += `- ${key}: ${desc}\n`;
            });
            
            // Adiciona um exemplo concreto baseado no schema
            promptText += `\nEXEMPLO DE RESPOSTA:\n`;
            promptText += `{\n`;
            Object.keys(schemaDescription).forEach((key, index, arr) => {
              promptText += `  "${key}": "valor de exemplo"${index < arr.length - 1 ? ',' : ''}\n`;
            });
            promptText += `}\n`;
            
            promptText += `\nIMPORTANTE: Responda APENAS com um objeto JSON válido contendo os campos acima. NÃO inclua metadados do schema ou formatação markdown.\n`;
          }
          
          // Se houver um prompt personalizado, use-o
          if (config.prompt) {
            promptText += `\n${config.prompt}\n`;
          }
          
          console.log("Prompt enviado ao modelo:", promptText);
          
          // Gera o texto usando o Ollama
          const result = await generateFromOllama(promptText, options.model || DEFAULT_MODEL);
          
          // Tenta parsear o resultado como JSON se houver um schema de saída
          if (config.output?.schema) {
            try {
              // Log para depuração
              console.log("Resposta bruta do modelo:", result);
              
              // Estratégias para extrair JSON da resposta
              // 1. Tenta encontrar JSON em bloco de código markdown
              let jsonMatch = result.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
              
              // 2. Tenta encontrar um objeto JSON completo em qualquer lugar do texto
              if (!jsonMatch) {
                jsonMatch = result.match(/(\{[\s\S]*\})/);
              }
              
              // 3. Tenta encontrar um array JSON completo
              if (!jsonMatch) {
                jsonMatch = result.match(/(\[[\s\S]*\])/);
              }
              
              let jsonText = '';
              let parsedResult = null;
              
              if (jsonMatch && jsonMatch[1]) {
                jsonText = jsonMatch[1].trim();
                console.log("Texto JSON extraído:", jsonText);
                
                try {
                  // Tenta parsear diretamente
                  parsedResult = JSON.parse(jsonText);
                } catch (initialParseError) {
                  console.warn("Erro no parse inicial, tentando completar JSON incompleto:", initialParseError);
                  
                  // Verifica se o JSON pode estar incompleto (faltando chaves de fechamento)
                  let fixedJson = jsonText;
                  
                  // Conta as chaves de abertura e fechamento
                  const openBraces = (jsonText.match(/\{/g) || []).length;
                  const closeBraces = (jsonText.match(/\}/g) || []).length;
                  
                  // Adiciona chaves de fechamento que faltam
                  if (openBraces > closeBraces) {
                    console.log(`JSON incompleto detectado: faltando ${openBraces - closeBraces} chaves de fechamento`);
                    fixedJson += '}'.repeat(openBraces - closeBraces);
                  }
                  
                  // Verifica se falta vírgula entre campos
                  fixedJson = fixedJson.replace(/("[^"]*")\s*\n\s*(")/g, '$1,\n$2');
                  
                  // Outras correções comuns
                  const cleanedJson = fixedJson
                    // Remove caracteres não imprimíveis
                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                    // Tenta corrigir aspas
                    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
                    // Remove vírgulas extras antes de fechamento
                    .replace(/,\s*([\]}])/g, '$1');
                  
                  console.log("JSON corrigido:", cleanedJson);
                  try {
                    parsedResult = JSON.parse(cleanedJson);
                    console.log("JSON corrigido parseado com sucesso!");
                  } catch (cleanedParseError) {
                    console.error("Erro mesmo após correções:", cleanedParseError);
                  }
                }
              }
              
              // Se conseguimos parsear o JSON, retorna-o com campos padrão garantidos
              if (parsedResult) {
                // Garante que campos comuns sempre tenham valores padrão mesmo se não existirem na resposta
                const commonFields = {
                  keyPoints: [],
                  mainPoints: [],
                  examples: [],
                  summary: '',
                  explanation: '',
                  title: '',
                  description: '',
                  simplifiedExplanation: '',
                  analogy: '',
                  understandingQuestion: ''
                };
                
                // Garante que arrays sejam sempre arrays mesmo se o modelo retornar strings
                const processedResult = { ...parsedResult };
                
                // Determina quais campos devem ser arrays com base no schema
                const expectedArrayFields: string[] = [];
                try {
                  const fullSchema = config.output.schema.describe();
                  if (fullSchema.shape) {
                    Object.entries(fullSchema.shape).forEach(([key, fieldSchema]: [string, any]) => {
                      // Verifica se o campo é um array no schema
                      if (fieldSchema.type === 'array') {
                        expectedArrayFields.push(key);
                      }
                    });
                  }
                } catch (e) {
                  console.warn("Erro ao extrair informações de array do schema:", e);
                  // Fallback para campos comuns que geralmente são arrays
                  expectedArrayFields.push('keyPoints', 'mainPoints', 'examples');
                }
                
                // Converte campos que devem ser arrays mas vieram como strings
                expectedArrayFields.forEach(field => {
                  if (typeof processedResult[field] === 'string') {
                    // Se veio como string, tenta converter para array apenas se esperado como array
                    try {
                      // Tenta parsear como JSON array
                      const parsed = JSON.parse(processedResult[field]);
                      if (Array.isArray(parsed)) {
                        processedResult[field] = parsed;
                      } else {
                        // Se não for array mas esperamos um array, cria um array com o item
                        processedResult[field] = [processedResult[field]];
                      }
                    } catch (e) {
                      // Se falhar, cria um array com o valor string
                      processedResult[field] = [processedResult[field]];
                    }
                  } else if (processedResult[field] && !Array.isArray(processedResult[field]) && expectedArrayFields.includes(field)) {
                    // Se existir mas não for array, e esperamos um array, converte para array
                    processedResult[field] = [processedResult[field]];
                  }
                });
                
                // Mescla os valores padrão com a resposta processada, priorizando a resposta
                return { ...commonFields, ...processedResult };
              }
              
              // Tenta uma extração mais direta baseada em regex quando o JSON está muito malformado
              console.warn('Tentando extração direta via regex para JSON malformado');
              
              // Extrai os campos esperados do schema
              const schemaFields = Object.keys(config.output.schema.describe().shape || {});
              // Use a more flexible type that can hold both strings and arrays
              const regexResult: Record<string, any> = {};
              
              // Tenta extrair cada campo específico usando padrões comuns
              for (const field of schemaFields) {
                // Padrões diferentes para capturar valores:
                // 1. Campo no formato "field": "value"
                const jsonPattern = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
                // 2. Campo no formato field: value (sem aspas)
                const loosePattern = new RegExp(`${field}\\s*:\\s*([^,\\n\\r}]*)`, 'i');
                
                let match = result.match(jsonPattern);
                if (!match) {
                  match = result.match(loosePattern);
                }
                
                if (match && match[1]) {
                  regexResult[field] = match[1].trim();
                } else {
                  // Se não encontrou, tenta uma busca mais ampla no texto
                  const textSearch = new RegExp(`${field}[^:]*:\\s*([^\\n\\r.!?]*)`, 'i');
                  match = result.match(textSearch);
                  if (match && match[1]) {
                    regexResult[field] = match[1].trim();
                  } else {
                    regexResult[field] = `Não foi possível extrair o campo "${field}"`;
                  }
                }
              }
              
              console.log("Resultado extraído via regex:", regexResult);
              // Garante que campos comuns sempre tenham valores padrão mesmo se não existirem na resposta
              const commonFields = {
                keyPoints: [],
                mainPoints: [],
                examples: [],
                summary: '',
                explanation: '',
                title: '',
                description: '',
                simplifiedExplanation: '',
                analogy: '',
                understandingQuestion: ''
              };
              
              // Processa campos especiais do resultado extraído por regex
              const processedRegexResult: Record<string, any> = { ...regexResult };
              
              // Determina quais campos devem ser arrays com base no schema
              const expectedArrayFields: string[] = [];
              try {
                const fullSchema = config.output.schema.describe();
                if (fullSchema.shape) {
                  Object.entries(fullSchema.shape).forEach(([key, fieldSchema]: [string, any]) => {
                    // Verifica se o campo é um array no schema
                    if (fieldSchema.type === 'array') {
                      expectedArrayFields.push(key);
                    }
                  });
                }
              } catch (e) {
                console.warn("Erro ao extrair informações de array do schema:", e);
                // Fallback para campos comuns que geralmente são arrays
                expectedArrayFields.push('keyPoints', 'mainPoints', 'examples');
              }
              
              // Tenta converter campos que devem ser arrays
              expectedArrayFields.forEach(field => {
                if (typeof processedRegexResult[field] === 'string') {
                  try {
                    // Tenta várias abordagens para extrair uma array
                    const value = processedRegexResult[field];
                    
                    // Tenta como JSON array
                    try {
                      const parsed = JSON.parse(value);
                      if (Array.isArray(parsed)) {
                        processedRegexResult[field] = parsed;
                        return;
                      }
                    } catch {}
                    
                    // Tenta como lista de itens separados por vírgula
                    if (value.includes(',')) {
                      processedRegexResult[field] = value.split(',').map(item => item.trim());
                      return;
                    }
                    
                    // Tenta como lista com marcadores
                    if (value.includes('-') || value.includes('•')) {
                      const items = value.split(/[-•]/).filter(Boolean).map(item => item.trim());
                      if (items.length > 1) {
                        processedRegexResult[field] = items;
                        return;
                      }
                    }
                    
                    // Por fim, trata como um único item
                    processedRegexResult[field] = [processedRegexResult[field]] as any;
                  } catch (e) {
                    // Se todas as tentativas falharem, usa um array com o valor original
                    processedRegexResult[field] = [processedRegexResult[field]] as any;
                  }
                }
              });
              
              return { ...commonFields, ...processedRegexResult };
            } catch (parseError) {
              console.error('Erro ao processar a resposta:', parseError);
              
              // Retorna um objeto com mensagem de erro como fallback final
              const schemaFields = Object.keys(config.output.schema.describe().shape || {});
              const errorResult: Record<string, any> = {};
              
              for (const field of schemaFields) {
                errorResult[field] = `Erro ao processar a resposta para o campo "${field}"`;
              }
              
              // Garante que campos comuns sempre tenham valores padrão mesmo no caso de erro
              const commonFields = {
                keyPoints: [],
                mainPoints: [],
                examples: [],
                summary: '',
                explanation: '',
                title: '',
                description: '',
                simplifiedExplanation: '',
                analogy: '',
                understandingQuestion: ''
              };
              
              return { ...commonFields, ...errorResult };
            }
          }
          
          return result;
        } catch (error) {
          console.error(`Erro ao executar prompt "${config.name}":`, error);
          throw error;
        }
      },
      
      // Placeholder para generateStream que será definido abaixo
      generateStream: null as any
    };
    
    // Define o método generateStream separadamente para poder referenciar o promptObject
    promptObject.generateStream = async (input: any, options: any = {}) => {
      const { onStream } = options;
      if (!onStream) {
        // Se não houver callback de stream, usa a versão não-streaming
        return { text: await promptObject.generate(input, options) };
      }
      
      try {
        // Constrói o prompt baseado no input e na configuração
        let promptText = `${config.name}:\n`;
        promptText += `Input: ${JSON.stringify(input, null, 2)}\n`;
        
        if (config.output?.schema) {
          promptText += `Output (formato esperado): ${JSON.stringify(config.output.schema.describe(), null, 2)}\n`;
        }
        
        // Inicia o streaming
        let fullText = '';
        
        // Função para receber tokens do streaming
        const handleToken = (token: string) => {
          fullText += token;
          onStream({ text: token, fullText });
        };
        
        // Inicia o streaming de fato
        await streamFromOllama(promptText, handleToken, options.model || DEFAULT_MODEL);
        
        return { text: fullText };
      } catch (error) {
        console.error(`Erro ao executar prompt "${config.name}" com streaming:`, error);
        throw error;
      }
    };
    
    // Adiciona a capacidade de chamar o objeto prompt diretamente como uma função
    const promptFunction = async (input: any, options: any = {}) => {
      try {
        const result = await promptObject.generate(input, options);
        return { output: result };
      } catch (error) {
        console.error(`Erro ao executar prompt "${promptConfig.name}":`, error);
        throw error;
      }
    };
    
    // Adiciona as propriedades e métodos do promptObject ao promptFunction
    Object.assign(promptFunction, promptObject);
    
    return promptFunction as any;
  },

  // Implementação do método defineFlow que estava faltando
  defineFlow: (config: any, flowFn: Function) => {
    // Preserva a configuração original para referência
    const flowConfig = { ...config };
    
    // Retorna uma função que executa o fluxo
    return async (input: any, options: any = {}) => {
      try {
        console.log(`Executando fluxo "${flowConfig.name}" com input:`, input);
        
        // Executa a função de fluxo fornecida pelo usuário
        const result = await flowFn(input, options);
        
        console.log(`Fluxo "${flowConfig.name}" concluído com sucesso.`);
        return result;
      } catch (error) {
        console.error(`Erro ao executar fluxo "${flowConfig.name}":`, error);
        throw error;
      }
    };
  }
};
