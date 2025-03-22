import OpenAI from 'openai';
import { fetchCategories } from './api';
import { Product } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function getSystemPrompt() {
  const categoriesString = await fetchCategories();
  
  const SYSTEM_PROMPT = `
You are a product API search assistant. Convert voice commands into structured search parameters.
Parse natural spanish language into specific search criteria on english including:
- Search terms, but only when the user is being clearly specific. If there is a category don't use search parameter.
- Category filters (If the user asks for an existing category, search by category)
  - Categories available are ${categoriesString}
- Sorting preferences (available fields: price, discountPercentage, rating)
  - When user mentions ordering or sorting, include sortBy and order parameters
  - For ascending order use terms like: menor a mayor, más baratos primero, mejores descuentos, mejor valorados
  - For descending order use terms like: mayor a menor, más caros primero, peores descuentos, peor valorados
- Pagination (limit/skip)
- Field selection

Return only a JSON object with the following structure:
{
  "action": "search" | "filter" | "sort" | "category" | "chat",
  "filters": {
    "search": string (optional),
    "category": string (optional),
    "sortBy": string (optional),
    "order": "asc" | "desc" (optional),
    "limit": number (optional, default 9),
    "skip": number (optional),
    "select": string[] (optional)
  }
}`;
  return SYSTEM_PROMPT;
}

const PRODUCT_DESCRIPTION_PROMPT = `
Eres un experto en productos que analiza y destaca las características más importantes.
Para cada producto, proporciona un breve análisis de 2-3 frases resaltando:
- Sus puntos fuertes principales
- Para qué tipo de usuario es ideal
- Qué lo hace especial o único
Sé conciso pero persuasivo. Responde en español.
`;

function isChatQuery(transcript: string): boolean {
  const chatTriggers = [
    'cuéntame',
    'dime',
    'qué',
    'cuales',
    'cuáles',
    'háblame',
    'describe',
    'explica',
    'información',
    'informacion',
    'detalles',
    'resumen',
    'características',
    'caracteristicas',
    'cómo',
    'como',
    'hay'
  ];

  const lowercaseTranscript = transcript.toLowerCase();
  return chatTriggers.some(trigger => lowercaseTranscript.includes(trigger));
}

export async function processVoiceCommand(transcript: string) {
  console.log('Processing voice command:', transcript);
  
  const systemPrompt = await getSystemPrompt();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(completion.choices[0].message.content);
  console.log("OpenAI Filter Response:", result);

  if (isChatQuery(transcript)) {
    console.log('Detected chat request, adding chat action while keeping filters');
    return {
      action: "chat",
      filters: {
        ...result.filters,
        limit: 5,
        select: ['title', 'price', 'description', 'rating', 'discountPercentage']
      }
    };
  }

  return result;
}

export async function getProductDescription(product: Product) {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: PRODUCT_DESCRIPTION_PROMPT },
      { 
        role: "user", 
        content: `Producto: ${product.title}\nDescripción: ${product.description}\nPrecio: $${product.price}${product.discountPercentage ? `\nDescuento: ${product.discountPercentage}%` : ''}${product.rating ? `\nValoración: ${product.rating}/5` : ''}`
      }
    ],
    stream: true
  });

  return stream;
}