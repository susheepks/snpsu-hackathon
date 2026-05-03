"""Run this once in WSL to patch the get_google_summary function in agent3.py"""
import re, pathlib

agent3 = pathlib.Path.home() / "agent3.py"
content = agent3.read_text()

OLD = '''async def get_google_summary(page):
    """Extracts the AI Overview from Google Search results."""
    await asyncio.sleep(3)
    try:
        summary = await page.inner_text("div[data-attrid='wa-as-ai-generated-answer'], .Kevs9, .LGOv1b")
        return summary.split("Sources")[0].strip()
    except:
        return "I\'ve pulled up the search results, but a direct summary was not available."'''

NEW = '''async def get_google_summary(page):
    """Extracts useful info from Google Search results — tries many selectors."""
    await asyncio.sleep(4)

    # Ordered list of selectors to try (most specific first)
    selectors = [
        "div[data-attrid='wa-as-ai-generated-answer']",  # AI Overview
        ".ILfuVd",          # AI overview container (newer)
        ".Kevs9",           # AI overview (older)
        ".LGOv1b",          # AI overview (older)
        ".yDYNvb",          # Featured snippet text
        ".hgKElc",          # Featured snippet block
        ".kno-rdesc span",  # Knowledge panel description
        ".r0bn4c.rQMQod",  # Knowledge panel snippet
        ".MUxGbd.wwUB2c",  # AI overview paragraph
    ]

    for sel in selectors:
        try:
            text = await page.inner_text(sel, timeout=2000)
            text = text.strip()
            if text and len(text) > 30:
                return text.split("Sources")[0].strip()[:600]
        except Exception:
            continue

    # Last resort: grab first 3 organic result snippets
    try:
        snippets = await page.eval_on_selector_all(
            ".VwiC3b, .s3v9rd, .lEBKkf",
            "els => els.slice(0,3).map(e => e.innerText.trim()).filter(Boolean).join(\'  |  \')"
        )
        if snippets and len(snippets) > 30:
            return snippets[:600]
    except Exception:
        pass

    return "Search complete — see the Action Canvas for visual results."'''

if OLD in content:
    patched = content.replace(OLD, NEW)
    agent3.write_text(patched)
    print("✅ agent3.py patched successfully!")
else:
    print("❌ Could not find the exact function. Showing current lines 48-55:")
    for i, line in enumerate(content.splitlines()[47:56], 48):
        print(f"{i}: {line}")
