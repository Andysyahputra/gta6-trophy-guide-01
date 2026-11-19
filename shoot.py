# Take the 4 screenshots for this entry with headless Chromium (Playwright).
# Serves app/ on localhost:8080 (start `node serve.ts` first), marks 12 trophies
# as earned via localStorage so the tracker shows real progress, then captures:
#  1-cover.jpg   — hero progress + roadmap + filters + first trophies
#  2-story.jpg   — story filter, chapter/mission trophies with a guide open
#  3-spoiler.jpg — spoiler mode on: hidden story trophies masked
#  4-guide.jpg   — a guide with its sources open (the missable trophy)
# Screenshots are real renders of the app's own code, never edited.
import json
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8080"
OUT = "screenshots/"
EARNED = [
    "Just Like Paradise", "Paradise Lost", "Trust", "Cunning Stunts",
    "Master of None", "Earn Cash, Not Kudos", "Stick Fiddler",
    "Positive Mental Attitude", "One Last Thing", "Whip It Good",
    "The Goodtime State", "Let\u2019s Go Bowling",
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    # Seed earned progress, then reload so the app reads it.
    page.goto(BASE, wait_until="networkidle")
    page.evaluate(
        "names => localStorage.setItem('leonida-trophy-atlas-v1', JSON.stringify(names))",
        EARNED,
    )

    # 1 — cover: top of the page, progress + roadmap + controls + first rows.
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(400)
    page.screenshot(path=OUT + "1-cover.jpg", type="jpeg", quality=78)

    # 2 — story filter with a guide open, scrolled to the list.
    page.goto(BASE + "/?kind=story", wait_until="networkidle")
    page.wait_for_timeout(300)
    page.locator(".guide-toggle").nth(1).click()  # Paradise Lost guide
    page.wait_for_timeout(200)
    page.evaluate("document.querySelector('#trophyList').scrollIntoView()")
    page.wait_for_timeout(200)
    page.screenshot(path=OUT + "2-story.jpg", type="jpeg", quality=78)

    # 3 — spoiler mode on, scrolled to the list so masked trophies show.
    page.goto(BASE + "/?spoiler=on", wait_until="networkidle")
    page.wait_for_timeout(300)
    page.evaluate("document.querySelector('#trophyList').scrollIntoView()")
    page.wait_for_timeout(200)
    page.screenshot(path=OUT + "3-spoiler.jpg", type="jpeg", quality=78)

    # 4 — the missable trophy's guide and sources open. The search also matches
    # Paradise Lost (its guide names this trophy), so the missable one is 2nd.
    page.goto(BASE + "/?q=Positive%20Mental%20Attitude", wait_until="networkidle")
    page.wait_for_timeout(300)
    page.locator(".guide-toggle").nth(1).click()
    page.wait_for_timeout(200)
    page.evaluate("document.querySelector('#trophyList').scrollIntoView()")
    page.wait_for_timeout(200)
    page.screenshot(path=OUT + "4-guide.jpg", type="jpeg", quality=78)

    browser.close()
print("screenshots done")
