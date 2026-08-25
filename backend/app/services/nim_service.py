import asyncio
import random
import logging
import httpx
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger("recoverai.nim")

class NIMService:
    def __init__(self):
        self.api_key = settings.NGC_API_KEY
        self.base_url = settings.NIM_BASE_URL
        self.model = settings.NIM_MODEL
        self.max_retries = settings.NIM_MAX_RETRIES
        self.base_delay = settings.NIM_BASE_DELAY
        self.max_delay = settings.NIM_MAX_DELAY

    async def generate_completion(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Calls NVIDIA NIM OpenAI-compatible endpoint with bounded exponential backoff + jitter.
        Returns None if unavailable or max retries exceeded.
        """
        if not self.api_key:
            logger.info("NVIDIA NGC_API_KEY not configured. Falling back to deterministic rules.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 512
        }

        url = f"{self.base_url.rstrip('/')}/chat/completions"

        async with httpx.AsyncClient(timeout=10.0) as client:
            for attempt in range(self.max_retries):
                try:
                    response = await client.post(url, headers=headers, json=payload)
                    
                    if response.status_code == 200:
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                    
                    if response.status_code == 429:
                        if attempt == self.max_retries - 1:
                            logger.warning("NIM Rate Limit (429): All retries exhausted. Using graceful fallback.")
                            return None
                        
                        # Exponential backoff with jitter
                        delay = min(self.base_delay * (2 ** attempt) + random.uniform(0, 1), self.max_delay)
                        logger.info(f"NIM Rate Limit (429), retrying in {delay:.2f}s (attempt {attempt + 1}/{self.max_retries})")
                        await asyncio.sleep(delay)
                        continue

                    logger.error(f"NIM API returned HTTP {response.status_code}: {response.text}")
                    return None

                except httpx.TimeoutException:
                    logger.warning(f"NIM API timeout on attempt {attempt + 1}")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(1.0)
                except Exception as e:
                    logger.error(f"NIM API request failed: {e}")
                    return None

        return None

nim_service = NIMService()
