# Hugging Face React Chat (Vercel Ready)

Chat en tiempo real con streaming SSE desde Hugging Face Inference API.

## Características

- Streaming en tiempo real para cualquier modelo Hugging Face.
- Ajuste automático de `max_new_tokens`.
- Detecta modelos de instrucción y aplica sampling.
- Retorno de texto limpio.
- Compatible con `gpt2`, `distilgpt2`, `flan-t5-small`, `bloomz`, `falcon`, etc.

## Deploy en Vercel

1. Instala dependencias:

```bash
npm install
