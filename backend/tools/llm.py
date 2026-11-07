import os
import json
import re
import httpx
from typing import Optional, Dict, Any, List

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3.5:latest")

async def check_ollama_health() -> Dict[str, Any]:
    """Checks if Ollama daemon is reachable and lists available models."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                model_ready = any(OLLAMA_MODEL in m for m in models)
                return {
                    "connected": True,
                    "model": OLLAMA_MODEL,
                    "model_available": model_ready,
                    "models": models
                }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
            "model": OLLAMA_MODEL,
            "model_available": False,
            "models": []
        }
    return {"connected": False, "model": OLLAMA_MODEL, "model_available": False, "models": []}

async def call_ollama(
    prompt: str,
    system: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1200,
    num_ctx: int = 8192,
    think: bool = False,
    timeout: float = 180.0,
    retries: int = 1,
) -> str:
    """
    Calls Ollama HTTP API directly with optimized options for local LLM execution.
    - keep_alive='60m' keeps model resident in memory.
    - think=False bypasses chain-of-thought tokens on reasoning models like qwen3.5 to dramatically accelerate drafting.
    - num_ctx=8192 prevents prompt truncation.
    - num_predict=max_tokens ensures full section completion.
    """
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "think": think,
        "keep_alive": "60m",
        "options": {
            "temperature": temperature,
            "top_p": 0.9,
            "num_predict": max_tokens,
            "num_ctx": num_ctx,
            "repeat_penalty": 1.1,
        }
    }
    if system:
        payload["system"] = system

    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    res_text = data.get("response", "").strip()
                    
                    # Clean out any stray <think>...</think> tags if present in the text
                    res_text = re.sub(r"<think>[\s\S]*?</think>", "", res_text).strip()
                    
                    eval_cnt = data.get("eval_count", 0)
                    eval_dur = data.get("eval_duration", 1) / 1e9
                    tok_per_sec = eval_cnt / eval_dur if eval_dur > 0 else 0
                    done_reason = data.get("done_reason", "unknown")
                    
                    if res_text:
                        print(f"[Ollama OK] generated {eval_cnt} tokens ({tok_per_sec:.1f} tok/s, reason: {done_reason})")
                        return res_text
                    elif attempt < retries:
                        print(f"[Ollama Empty Response] Retrying ({attempt+1}/{retries})...")
                        continue
                else:
                    print(f"[Ollama Error] HTTP {response.status_code}: {response.text}")
                    if attempt < retries:
                        continue
        except httpx.ReadTimeout:
            print(f"[Ollama Timeout] Request timed out after {timeout}s (attempt {attempt+1}/{retries+1})")
            if attempt < retries:
                continue
        except Exception as e:
            print(f"[Ollama Exception] {e} (attempt {attempt+1}/{retries+1})")
            if attempt < retries:
                continue
    return ""

def parse_json_from_llm(text: str) -> Optional[Any]:
    """Robustly extracts JSON object or array from LLM response text."""
    if not text:
        return None
        
    text = re.sub(r"<think>[\s\S]*?</think>", "", text).strip()
    # Check if wrapped in ```json ... ``` or ``` ... ```
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if json_match:
        text = json_match.group(1).strip()
        
    try:
        return json.loads(text)
    except Exception:
        pass
        
    # Attempt finding first { and last } or first [ and last ]
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(text[first_brace:last_brace+1])
        except Exception:
            pass
            
    first_bracket = text.find('[')
    last_bracket = text.rfind(']')
    if first_bracket != -1 and last_bracket > first_bracket:
        try:
            return json.loads(text[first_bracket:last_bracket+1])
        except Exception:
            pass
            
    return None
