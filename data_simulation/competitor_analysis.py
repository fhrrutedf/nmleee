import requests
from bs4 import BeautifulSoup
import re
import json
import time
import os
from urllib.parse import urlparse

# Competitor list (can be expanded)
COMPETITORS = [
    "https://mostaql.com",
    "https://khamsat.com",
    "https://salla.sa",
    "https://zid.sa"
]

# Custom User-Agent for ethical identification
HEADERS = {
    "User-Agent": "ManasaDigital-Analysis-Bot/1.0 (Ethical Researcher; +https://manasadigital.com)",
    "Accept-Language": "ar,en;q=0.9"
}

def analyze_competitors(urls=None):
    """
    Analyzes competitor websites for SEO, Arabic support, and pricing indicators.
    """
    if urls is None:
        urls = COMPETITORS
        
    print(f"Starting Competitor Analysis for {len(urls)} sites...")
    results = []
    
    # Arabic Regex
    arabic_pattern = re.compile(r'[\u0600-\u06FF]')
    
    # Pricing Keywords (Arabic & English)
    pricing_keywords = [
        "خطة", "سعر", "اشترك", "باقات", "تسعير", "اشتراك",
        "pricing", "plans", "subscribe", "buy", "billing", "pricing-plans"
    ]

    for url in urls:
        print(f"Fetching: {url}...")
        report = {
            "url": url,
            "domain": urlparse(url).netloc,
            "status": "Success",
            "title": "N/A",
            "meta_description": "N/A",
            "has_arabic": False,
            "has_pricing": False,
            "links_count": 0,
            "error": None
        }

        try:
            # 1. Respectful Request with Timeout
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            
            # Use appropriate encoding for Arabic sites
            response.encoding = response.apparent_encoding
            
            soup = BeautifulSoup(response.text, 'html.parser')

            # 2. Extract Title & Meta Description
            report["title"] = soup.title.string.strip() if soup.title else "No Title Found"
            
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                report["meta_description"] = meta_desc.get("content", "").strip()
            
            # 3. Arabic Support Detection
            full_text = soup.get_text()
            if arabic_pattern.search(full_text):
                report["has_arabic"] = True
            
            # 4. Pricing Indicators
            # Check text content and URLs in links
            for kw in pricing_keywords:
                if kw.lower() in full_text.lower():
                    report["has_pricing"] = True
                    break
            
            # 5. Links Count
            links = soup.find_all('a', href=True)
            report["links_count"] = len(links)

        except requests.exceptions.HTTPError as e:
            report["status"] = "Failed"
            report["error"] = f"HTTP Error: {e.response.status_code}"
        except requests.exceptions.Timeout:
            report["status"] = "Failed"
            report["error"] = "Request Timeout"
        except requests.exceptions.SSLError:
            report["status"] = "Failed"
            report["error"] = "SSL Verification Failed"
        except Exception as e:
            report["status"] = "Failed"
            report["error"] = str(e)

        results.append(report)
        
        # 6. Delay between requests (Ethical crawling)
        print(f"   Done. Sleeping 1.5s...")
        time.sleep(1.5)

    # 7. Save Results
    output_path = "competitor_analysis.json"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        
        # 8. Quick Report
        print("\n" + "="*40)
        print("ANALYSIS SUMMARY")
        print("="*40)
        for r in results:
            status_icon = "[OK]" if r["status"] == "Success" else "[FAIL]"
            ar_icon = "YES" if r["has_arabic"] else "NO"
            price_icon = "FOUND" if r["has_pricing"] else "NOT FOUND"
            
            print(f"{status_icon} {r['domain']}")
            if r["status"] == "Success":
                # Clean title for console output
                clean_title = r['title'].encode('ascii', 'ignore').decode('ascii')[:50]
                print(f"   - Title: {clean_title}...")
                print(f"   - Arabic: {ar_icon} | Pricing: {price_icon} | Links: {r['links_count']}")
            else:
                print(f"   - Error: {r['error']}")
        print("="*40)
        print(f"Full report saved to: {os.path.abspath(output_path)}")

    except Exception as e:
        print(f"Error saving report: {e}")

if __name__ == "__main__":
    analyze_competitors()
