import fetch from "node-fetch";

export default async function handler(req, res) {
  const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
  if (!HF_TOKEN) return res.status(500).send("Token Hugging Face no configurado");

  const { model_name, message } = req.body;
  if (!model_name || !message) return res.status(400).send("Faltan parámetros");

  // Detecta modelos de instrucción
  const instruccion = ["flan-t5", "bloomz", "falcon"];
  const esInstruccion = instruccion.some(name => model_name.toLowerCase().includes(name));

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  try {
    const bodyPayload = esInstruccion
      ? { inputs: message, parameters: { max_new_tokens: 150, do_sample: true, top_p: 0.95, top_k: 50 } }
      : { inputs: message };

    const response = await fetch(`https://api-inference.huggingface.co/models/${model_name}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.body) throw new Error("No se pudo abrir el stream");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        res.write(`data: ${chunk}\n\n`);
      }
    }

    res.write("event: end\ndata: FIN\n\n");
    res.end();

  } catch (err) {
    console.error(err);
    res.write(`event: error\ndata: ${err.message}\n\n`);
    res.end();
  }
}
