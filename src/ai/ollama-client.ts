/**
 * Cliente para interagir diretamente com o Ollama.
 * Requer que o Ollama esteja instalado e rodando localmente.
 * 
 * Instalação do Ollama: https://ollama.ai/download
 * Documentação da API: https://github.com/jmorganca/ollama/blob/main/docs/api.md
 * 
 * Instale o cliente com: npm install ollama
 */

import { Ollama } from 'ollama';

// Crie uma instância do cliente Ollama
const ollama = new Ollama({
  host: 'http://localhost:11434', // URL padrão do servidor Ollama local
});

/**
 * Gera texto usando o modelo Ollama especificado.
 * 
 * @param prompt O texto de prompt para o modelo
 * @param model O modelo Ollama a ser usado (precisa estar disponível localmente)
 * @returns O texto gerado como resposta
 */
export async function generateFromOllama(
  prompt: string, 
  model: string = 'llama3.2:3b'
): Promise<string> {
  try {
    const response = await ollama.generate({
      model,
      prompt,
    });
    
    return response.response;
  } catch (error) {
    console.error('Erro ao acessar Ollama:', error);
    throw error;
  }
}

/**
 * Gera texto em modo de streaming usando o modelo Ollama especificado.
 * 
 * @param prompt O texto de prompt para o modelo
 * @param onToken Callback executado a cada token recebido
 * @param model O modelo Ollama a ser usado (precisa estar disponível localmente)
 */
export async function streamFromOllama(
  prompt: string,
  onToken: (token: string) => void,
  model: string = 'llama3.2:3b'
): Promise<void> {
  try {
    // Usando o método chat com streaming correto conforme a API do ollama
    const stream = await ollama.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });
    
    // Iterando pelo stream de respostas
    for await (const chunk of stream) {
      if (chunk.message?.content) {
        onToken(chunk.message.content);
      }
    }
  } catch (error) {
    console.error('Erro ao acessar Ollama em modo stream:', error);
    throw error;
  }
}

/**
 * Verifica se o servidor Ollama está acessível.
 * 
 * @returns true se o servidor estiver disponível, false caso contrário
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch (error) {
    return false;
  }
}
