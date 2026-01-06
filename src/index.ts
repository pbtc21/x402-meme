import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  AI: Ai;
  PAYMENT_ADDRESS: string;
  PRICE_SATS: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

// Landing page
app.get('/', (c) => {
  const price = c.env.PRICE_SATS;

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>x402 Meme Generator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #fff;
      padding: 2rem;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 {
      font-size: 3rem;
      text-align: center;
      text-shadow: 3px 3px 0 #000, -1px -1px 0 #000;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      text-align: center;
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .price-tag {
      background: #ff6b6b;
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
      margin: 0 auto;
      display: block;
      width: fit-content;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-top: 2rem;
    }
    label {
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    textarea, select {
      width: 100%;
      padding: 1rem;
      border-radius: 10px;
      border: none;
      font-size: 1rem;
      margin-bottom: 1rem;
      font-family: inherit;
    }
    textarea { height: 100px; resize: vertical; }
    select { background: #fff; }
    .btn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #fff;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      border-radius: 30px;
      cursor: pointer;
      width: 100%;
      font-family: inherit;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    #result {
      margin-top: 2rem;
      text-align: center;
      display: none;
    }
    #result img {
      max-width: 100%;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }
    #result.show { display: block; }
    .loading {
      font-size: 2rem;
      animation: bounce 0.5s infinite alternate;
    }
    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-10px); }
    }
    .examples {
      margin-top: 1rem;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .examples span {
      background: rgba(255,255,255,0.2);
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      margin: 0.2rem;
      display: inline-block;
      cursor: pointer;
    }
    .examples span:hover { background: rgba(255,255,255,0.3); }
    .api-docs {
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(0,0,0,0.2);
      border-radius: 15px;
    }
    .api-docs h3 { margin-bottom: 1rem; }
    code {
      background: rgba(0,0,0,0.3);
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-family: monospace;
    }
    pre {
      background: rgba(0,0,0,0.3);
      padding: 1rem;
      border-radius: 10px;
      overflow-x: auto;
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎭 x402 Meme Generator</h1>
    <p class="subtitle">AI-powered memes, paid with Bitcoin</p>
    <div class="price-tag">⚡ ${price} sats per meme</div>

    <div class="card">
      <label>Describe your meme:</label>
      <textarea id="prompt" placeholder="A cat wearing sunglasses saying 'deal with it'"></textarea>

      <div class="examples">
        <strong>Try:</strong>
        <span onclick="setPrompt('Distracted boyfriend meme but with Bitcoin and fiat')">Distracted BF</span>
        <span onclick="setPrompt('Drake meme: rejecting banks, approving Bitcoin')">Drake</span>
        <span onclick="setPrompt('Surprised Pikachu reacting to Bitcoin pump')">Pikachu</span>
        <span onclick="setPrompt('Galaxy brain expanding with each Bitcoin insight')">Galaxy Brain</span>
      </div>

      <label style="margin-top: 1rem;">Style:</label>
      <select id="style">
        <option value="meme">Classic Meme</option>
        <option value="cartoon">Cartoon</option>
        <option value="realistic">Realistic</option>
        <option value="pixel">Pixel Art</option>
        <option value="anime">Anime</option>
      </select>

      <button class="btn" id="generateBtn" onclick="generate()">
        🚀 Generate Meme
      </button>
    </div>

    <div id="result">
      <div id="loading" class="loading">🎨 Creating your meme...</div>
      <img id="memeImage" style="display: none;" />
      <p id="downloadLink" style="margin-top: 1rem; display: none;">
        <a href="#" id="download" style="color: #fff;">📥 Download Meme</a>
      </p>
    </div>

    <div class="api-docs">
      <h3>🔌 API Usage</h3>
      <p>Generate memes programmatically with x402 payment:</p>
      <pre>POST /api/generate
Content-Type: application/json

{
  "prompt": "Your meme description",
  "style": "meme|cartoon|realistic|pixel|anime"
}</pre>
      <p style="margin-top: 0.5rem;">Returns <code>402 Payment Required</code> with payment details, then the image after payment.</p>
    </div>
  </div>

  <script>
    function setPrompt(text) {
      document.getElementById('prompt').value = text;
    }

    async function generate() {
      const prompt = document.getElementById('prompt').value.trim();
      const style = document.getElementById('style').value;

      if (!prompt) {
        alert('Please describe your meme!');
        return;
      }

      const btn = document.getElementById('generateBtn');
      const result = document.getElementById('result');
      const loading = document.getElementById('loading');
      const img = document.getElementById('memeImage');
      const downloadLink = document.getElementById('downloadLink');

      btn.disabled = true;
      btn.textContent = '⏳ Generating...';
      result.classList.add('show');
      loading.style.display = 'block';
      img.style.display = 'none';
      downloadLink.style.display = 'none';

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, style })
        });

        if (response.status === 402) {
          const payment = await response.json();
          loading.innerHTML = '💳 Payment required: ' + payment.amount + ' sats<br><small>Send to: ' + payment.payTo + '</small>';
          // In production, integrate with Stacks wallet
          return;
        }

        if (!response.ok) {
          throw new Error('Generation failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        img.src = url;
        img.style.display = 'block';
        loading.style.display = 'none';

        document.getElementById('download').href = url;
        document.getElementById('download').download = 'meme.png';
        downloadLink.style.display = 'block';

      } catch (error) {
        loading.textContent = '❌ Error: ' + error.message;
      } finally {
        btn.disabled = false;
        btn.textContent = '🚀 Generate Meme';
      }
    }
  </script>
</body>
</html>`);
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'x402-meme' });
});

// Generate meme endpoint
app.post('/api/generate', async (c) => {
  const body = await c.req.json();
  const { prompt, style = 'meme' } = body;

  if (!prompt) {
    return c.json({ error: 'prompt is required' }, 400);
  }

  // Check for payment header (x402 protocol)
  const paymentHeader = c.req.header('X-Payment');

  if (!paymentHeader) {
    // Return 402 Payment Required
    return c.json({
      amount: c.env.PRICE_SATS,
      payTo: c.env.PAYMENT_ADDRESS,
      tokenType: 'sBTC',
      network: 'mainnet',
      description: 'AI Meme Generation',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }, 402);
  }

  // In production, verify the payment transaction here
  // For now, we'll generate the meme

  try {
    // Build the AI prompt based on style
    const stylePrompts: Record<string, string> = {
      meme: 'internet meme style, bold impact font text, funny, viral meme format',
      cartoon: 'cartoon style, colorful, animated look, exaggerated expressions',
      realistic: 'photorealistic, high quality, detailed',
      pixel: '8-bit pixel art style, retro gaming aesthetic, pixelated',
      anime: 'anime style, manga aesthetic, Japanese animation style',
    };

    const fullPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.meme}, high quality, shareable`;

    // Generate image using Cloudflare AI
    const response = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: fullPrompt,
      num_steps: 4,
    });

    // Return the image
    return new Response(response, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'X-Meme-Prompt': encodeURIComponent(prompt),
      },
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return c.json({ error: 'Failed to generate meme: ' + error.message }, 500);
  }
});

// Preview endpoint (free, lower quality for testing)
app.post('/api/preview', async (c) => {
  const body = await c.req.json();
  const { prompt, style = 'meme' } = body;

  if (!prompt) {
    return c.json({ error: 'prompt is required' }, 400);
  }

  const stylePrompts: Record<string, string> = {
    meme: 'internet meme style, bold impact font text, funny',
    cartoon: 'cartoon style, colorful, animated look',
    realistic: 'photorealistic, detailed',
    pixel: '8-bit pixel art style, retro',
    anime: 'anime style, manga aesthetic',
  };

  const fullPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.meme}`;

  try {
    const response = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: fullPrompt,
      num_steps: 2, // Fewer steps for preview
    });

    return new Response(response, {
      headers: {
        'Content-Type': 'image/png',
        'X-Preview': 'true',
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
