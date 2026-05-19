#!/usr/bin/env python3
"""
从 Pexels 批量下载 WORDS_DB 中 aiImg("...") 用到的图片到 images/ 目录。
找不到结果的词会被跳过，运行时 index.html 中 onerror 会回退到 emoji 显示。

环境变量：
  PEXELS_API_KEY  必填，Pexels API key

用法：
  PEXELS_API_KEY='xxx' python3 download_pexels.py            # 串行下载
  PEXELS_API_KEY='xxx' python3 download_pexels.py --retry    # 重试失败/丢图的词
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, 'index.html')
OUT_DIR = os.path.join(HERE, 'images')
LOG = os.path.join(HERE, 'download_pexels.log')
MISS_FILE = os.path.join(HERE, 'pexels_missing.txt')  # 没结果的词，方便事后人工补

# Pexels 实际免费层是 25000/hr（响应头 x-ratelimit-limit 确认）
# 我们 452 词远远用不完，可以快一点。但 Pexels 前端有 Cloudflare 反爬，太快可能被拦。
SLEEP_BETWEEN = 1.5
TIMEOUT = 60
MIN_OK_SIZE = 2048
MAX_RETRY = 3
RETRY_BACKOFF = 8

# Cloudflare 默认会拦 Python-urllib UA，必须伪装成浏览器
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36')

API_KEY = os.environ.get('PEXELS_API_KEY', '').strip()
if not API_KEY:
    print('ERROR: PEXELS_API_KEY env var not set', file=sys.stderr)
    sys.exit(1)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def extract_prompts() -> list:
    with open(HTML, 'r', encoding='utf-8') as f:
        html = f.read()
    return sorted(set(re.findall(r'aiImg\("([^"]+)"\)', html)))


def log(msg: str):
    line = time.strftime('[%H:%M:%S] ') + msg
    print(line, flush=True)
    with open(LOG, 'a', encoding='utf-8') as f:
        f.write(line + '\n')


# 全局节流：每次 API 调用之间至少间隔 SLEEP_BETWEEN 秒（不管失败/成功）
_last_api_call = 0.0
def _api_throttle():
    global _last_api_call
    now = time.monotonic()
    wait = SLEEP_BETWEEN - (now - _last_api_call)
    if wait > 0:
        time.sleep(wait)
    _last_api_call = time.monotonic()


def pexels_search(query: str):
    """返回首张照片的 (medium_url, photographer) 或 None。先 square 后 unfiltered。"""
    for params in (
        {'query': query, 'per_page': 1, 'orientation': 'square'},
        {'query': query, 'per_page': 1},
    ):
        url = 'https://api.pexels.com/v1/search?' + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={
            'Authorization': API_KEY,
            'User-Agent': UA,
            'Accept': 'application/json',
        })
        _api_throttle()
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = json.load(resp)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                log(f'  RATE LIMITED on "{query}" — sleeping 90s')
                time.sleep(90)
                continue
            log(f'  api {e.code} for "{query}" ({params.get("orientation","any")}): {e}')
            continue
        except Exception as e:
            log(f'  api error for "{query}" ({params.get("orientation","any")}): {e}')
            continue
        photos = data.get('photos') or []
        if photos:
            p = photos[0]
            src = p.get('src') or {}
            img_url = src.get('medium') or src.get('large') or src.get('original')
            if img_url:
                return img_url, p.get('photographer', '')
    return None


def download_image(url: str, out_path: str) -> int:
    """下载图片到本地，返回字节数（成功）或抛异常。"""
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        data = resp.read()
    if len(data) < MIN_OK_SIZE:
        raise RuntimeError(f'tiny response {len(data)} bytes')
    with open(out_path, 'wb') as f:
        f.write(data)
    return len(data)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    prompts = extract_prompts()
    log(f'extracted {len(prompts)} unique prompts')

    ok = skip = miss = fail = 0
    missing = []

    for i, prompt in enumerate(prompts, 1):
        slug = slugify(prompt)
        out_path = os.path.join(OUT_DIR, f'{slug}.jpg')

        if os.path.exists(out_path) and os.path.getsize(out_path) > MIN_OK_SIZE:
            skip += 1
            continue

        search_result = None
        for attempt in range(1, MAX_RETRY + 1):
            search_result = pexels_search(prompt)
            if search_result:
                break
            if attempt < MAX_RETRY:
                time.sleep(RETRY_BACKOFF * attempt)

        if not search_result:
            miss += 1
            missing.append(prompt)
            log(f'[{i}/{len(prompts)}] MISS  {prompt!r}  (no Pexels result → will fall back to emoji)')
            continue

        img_url, photographer = search_result
        try:
            size = download_image(img_url, out_path)
            ok += 1
            log(f'[{i}/{len(prompts)}] OK    {slug}.jpg ({size//1024} KB) — © {photographer}')
        except Exception as e:
            fail += 1
            missing.append(prompt)
            log(f'[{i}/{len(prompts)}] FAIL  {slug}.jpg — {e}')

    with open(MISS_FILE, 'w', encoding='utf-8') as f:
        for m in missing:
            f.write(m + '\n')

    log('=' * 50)
    log(f'done. ok={ok} skip={skip} miss={miss} fail={fail}')
    log(f'missing list saved to {MISS_FILE} ({len(missing)} words)')


if __name__ == '__main__':
    main()
