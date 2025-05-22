
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Configuração do Genkit.
 * Por padrão, usa o plugin Google AI.
 *
 * Informações sobre outros provedores (como Ollama):
 * Caso deseje experimentar outros provedores de modelos de IA compatíveis com Genkit no futuro:
 * 1. Instale o plugin do provedor para Genkit (ex: `npm install @genkit-ai/some-other-provider`).
 * 2. Importe o plugin neste arquivo.
 * 3. Modifique a seção `plugins` abaixo para incluir e configurar o novo plugin.
 *    Exemplo (hipotético):
 *
 *    import { someOtherProvider } from '@genkit-ai/some-other-provider';
 *    export const ai = genkit({
 *      plugins: [
 *        someOtherProvider({
 *          // ...configurações específicas do provedor
 *        }),
 *      ],
 *      model: 'provider/model-name', // Ajuste conforme o provedor
 *    });
 *
 * 4. Certifique-se de que o serviço do provedor (ex: um servidor local Ollama) esteja rodando.
 * 5. Reinicie o servidor de desenvolvimento do Genkit: `npm run genkit:dev` (ou `genkit:watch`)
 * 6. Reinicie o servidor de desenvolvimento do Next.js: `npm run dev`
 *
 * Lembre-se que diferentes modelos têm capacidades e formatos de resposta distintos.
 * Alguns prompts podem precisar de ajustes ao trocar de provedor/modelo.
 *
 * Atualmente, a opção de usar @genkit-ai/ollama foi removida pois o pacote
 * não foi encontrado no registro NPM durante a instalação.
 */

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
