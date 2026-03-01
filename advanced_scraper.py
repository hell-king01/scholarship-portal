import asyncio
import json
import logging
import os
import urllib.parse
from typing import List, Optional, Set
from pydantic import BaseModel, Field
from playwright.async_api import async_playwright
from google import genai
from google.genai import types
from supabase import create_client, Client
from duckduckgo_search import DDGS

# Configur2e logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("scraper.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

class Eligibility(BaseModel):
    category: List[str] = Field(default_factory=list)
    min_percentage: float = 0.0
    max_income: float = 0.0
    gender: List[str] = Field(default_factory=list)
    education_levels: List[str] = Field(default_factory=list)
    states: List[str] = Field(default_factory=list)
    parent_occupation: List[str] = Field(default_factory=list)
    minority: List[str] = Field(default_factory=list)
    hosteller: Optional[bool] = None
    disability: Optional[bool] = None

class Scholarship(BaseModel):
    title: str = ""
    provider: str = ""
    provider_type: str = Field(default="private", description="government | private | ngo")
    amount: float = 0.0
    amount_type: str = Field(default="yearly", description="yearly | monthly | one-time")
    deadline: str = Field(default="", description="YYYY-MM-DD")
    eligibility: Eligibility = Field(default_factory=Eligibility)
    application_url: str = ""
    tags: List[str] = Field(default_factory=list)

class ScholarshipList(BaseModel):
    scholarships: List[Scholarship] = Field(default_factory=list)

async def search_scholarship_urls(queries: List[str], max_results_per_query: int = 10, page=None) -> List[str]:
    """Search for scholarship URLs using DuckDuckGo first, then fallback to scraping Google with Playwright."""
    urls = set()
    try:
        ddgs = DDGS()
        for query in queries:
            logging.info(f"Searching DuckDuckGo for: {query}")
            try:
                # The duckduckgo-search library `DDGS.text()` often gets rate limited or blocked.
                results = list(ddgs.text(query, max_results=max_results_per_query))
                if results:
                    for r in results:
                        if 'href' in r:
                            urls.add(r['href'])
                            logging.info(f"Found URL: {r['href']}")
                else:
                    logging.warning(f"No results found on DDG for: {query}. Attempting Google fallback...")
                    if page:
                         encoded_query = urllib.parse.quote_plus(query)
                         google_url = f"https://www.google.com/search?q={encoded_query}"
                         await page.goto(google_url, wait_until="domcontentloaded", timeout=45000)
                         try:
                             await page.wait_for_selector('h3', timeout=5000)
                         except:
                             logging.warning(f"Timeout waiting for h3 on google search: {query}")
                             pass
                         await page.wait_for_timeout(2000)
                         
                         google_links = await page.evaluate('''() => {
                             return Array.from(document.querySelectorAll('a'))
                                 .map(a => a.href)
                                 .filter(href => href.startsWith('http') && !href.includes('google.com') && !href.includes('googleusercontent'));
                         }''')
                         
                         for link in google_links[:max_results_per_query]:
                             urls.add(link)
                             logging.info(f"Found URL (Google fallback): {link}")
                    
            except Exception as e:
                logging.error(f"Search failed for query '{query}': {e}")
            import time; time.sleep(2)
    except Exception as e:
        logging.error(f"DDGS Initialization failed: {e}")
    return list(urls)

async def fetch_page_content(url: str, page) -> str:
    """Navigate to the page and extract text/HTML."""
    logging.info(f"Navigating to {url}")
    try:
        # Government sites often have slow external trackers that never finish loading.
        # Use domcontentloaded instead of networkidle to grab text as soon as possible.
        await page.goto(url, wait_until="domcontentloaded", timeout=45000)
        
        # Give JS a quick hardcoded second to format the page before we snag the text
        await page.wait_for_timeout(2000)
        
        # Extract the visible text of the body to send to the LLM
        content = await page.evaluate("document.body.innerText")
        return content
    except Exception as e:
        logging.error(f"Failed to fetch {url}: {e}")
        return ""

def is_gov_website(url: str) -> bool:
    parsed_url = urllib.parse.urlparse(url)
    domain = parsed_url.netloc.lower()
    return ".gov.in" in domain or ".nic.in" in domain

def extract_scholarship_data(text_content: str, source_url: str, api_key: str, is_gov: bool) -> List[Scholarship]:
    """Use Gemini AI to extract scholarship details from unstructured text."""
    if not text_content.strip():
        return []
        
    try:
        # Initialize the Gemini client
        client = genai.Client(api_key=api_key)
        
        gov_prompt = f'''
        Extract all official schemes or scholarship information found in the following GOVERNMENT web page text.
        Source URL: {source_url}
        
        This is an official government portal. Extract as many distinct scholarships/schemes as you can find.
        Ensure you pull out the title, provider (e.g., Nodal Ministry or Department), deadline, amount, and eligibility tightly.
        PAY CRITICAL ATTENTION TO RESERVATION QUOTAS: SC, ST, OBC, EBC, EWS, Minority status, and income ceilings.
        If a field is not mentioned, use sensible defaults like 0.0 for numbers, empty lists for arrays, or leave it empty/null as appropriate. 

        Web Page Text:
        """
        {{text_content}}
        """
        '''
        
        std_prompt = f'''
        Extract all scholarship information found in the following web page text.
        Source URL: {source_url}
        
        This page might contain multiple scholarships (such as an index or list page). 
        Extract as many distinct scholarships as you can find.
        Ensure you pull out the title, provider, deadline, amount, and eligibility criteria accurately for each.
        If a field is not mentioned for a scholarship, use sensible defaults like 0.0 for numbers, empty lists for arrays, 
        or leave it empty/null as appropriate. 

        Web Page Text:
        """
        {{text_content}}
        """
        '''
        
        # Limit the text passed to the prompt to 40,000 characters
        text_truncated = text_content[:40000]
        prompt = gov_prompt.format(text_content=text_truncated) if is_gov else std_prompt.format(text_content=text_truncated)
        
        logging.info(f"Sending text to Gemini for AI extraction (Gov Mode: {is_gov})...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ScholarshipList,
                temperature=0.1, # Low temperature for more deterministic data extraction
            ),
        )
        
        logging.info(f"Gemini raw response: {response.text[:500]}...")
        
        # Pydantic validation: parse the JSON response from Gemini back into our model
        result = ScholarshipList.model_validate_json(response.text)
        
        # Override the application_url to fallback to the source URL if it wasn't found
        for scholarship in result.scholarships:
            if not scholarship.application_url:
                scholarship.application_url = source_url 
            if is_gov and scholarship.provider_type != "government":
                scholarship.provider_type = "government"
                
        return result.scholarships
        
    except Exception as e:
        logging.error(f"AI Extraction failed: {e}")
        return []

def get_processed_urls(supabase_url: str, supabase_key: str) -> Set[str]:
    """Fetch all previously scraped URLs so we don't repeat work."""
    if supabase_url == "YOUR_SUPABASE_URL_HERE":
        return set()
        
    processed = set()
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Scholarships table
        # We limit to last 2000 for practicality, can implement pagination for more
        res_ok = supabase.table("scholarships").select("application_url").limit(2000).execute()
        for row in res_ok.data:
            if row.get("application_url"):
                processed.add(row["application_url"])
                
        # Failed URLs table
        res_fail = supabase.table("failed_scholarships").select("url").limit(2000).execute()
        for row in res_fail.data:
            if row.get("url"):
                processed.add(row["url"])
                
        logging.info(f"Loaded {len(processed)} previously processed URLs from database to avoid rescraping.")
    except Exception as e:
        logging.error(f"Failed to fetch processed URLs: {e}")
        
    return processed

def push_to_supabase(data: List[dict], supabase_url: str, supabase_key: str, table_name: str = "scholarships"):
    """
    Push a list of structured scholarship dictionaries to a Supabase table.
    Flattens the 'eligibility' dictionary fields into individual columns.
    """
    if not data:
        logging.info("No data to push to Supabase.")
        return

    flattened_data = []
    for item in data:
        scholarship = item.copy()
        
        # Extract the nested eligibility dictionary if it exists
        if "eligibility" in scholarship:
            eligibility = scholarship.pop("eligibility", {})
            for key, value in eligibility.items():
                scholarship[key] = value
            
        flattened_data.append(scholarship)

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        response = supabase.table(table_name).insert(flattened_data).execute()
        logging.info(f"Successfully pushed {len(data)} records to Supabase table '{table_name}'.")
    except Exception as e:
        logging.error(f"Failed to push data to Supabase table '{table_name}': {e}")


def is_verified_source(url: str, text_content: str, api_key: str) -> bool:
    """
    Genuity Verification Layer
    Returns True if the URL is an authentic, official source offering a scholarship.
    Returns False if it is a third-party listing, aggregator, or news portal.
    """
    parsed_url = urllib.parse.urlparse(url)
    domain = parsed_url.netloc.lower()
    
    # Heuristic 1: Government and Academic domains are trusted automatically
    trusted_suffixes = [".gov.in", ".nic.in", ".edu.in", ".ac.in"]
    if any(domain.endswith(suffix) for suffix in trusted_suffixes):
        logging.info(f"VERIFIED: {url} passed heuristic trust check (Official/Academic domain).")
        return True
        
    # AI Authenticity Analysis for private providers / foundations
    try:
        client = genai.Client(api_key=api_key)
        prompt = f'''
        Analyze this URL and the webpage snippet.
        URL: {url}
        
        Is this website a PRIMARY, official foundation/trust offering a scholarship (e.g., Tata Trusts, Reliance Foundation)?
        Or is it a THIRD-PARTY aggregator/listing/news portal (e.g., Buddy4Study, IndiaScholarships, News sites) that just lists scholarships from elsewhere?
        
        You must reply with exactly one word: TRUSTED or REJECTED.
        
        Web Page Snippet:
        """
        {text_content[:2000]}
        """
        '''
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0)
        )
        
        res_text = response.text.strip().upper()
        if "TRUSTED" in res_text:
            logging.info(f"VERIFIED (AI): {url} passed Gemini genuity verification.")
            return True
        else:
            logging.info(f"REJECTED: {url} was flagged by AI as a third-party/aggregator.")
            return False
            
    except Exception as e:
        logging.error(f"Genuity verification failed for {url}: {e}. Defaulting to safe reject.")
        return False

async def extract_deep_links(page, base_url: str) -> Set[str]:
    """Finds links on an official index page that look like individual scholarship schemes."""
    links = set()
    try:
        # Extract all hrefs
        all_links = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.startsWith('http'));
        }''')
        
        # Filter for links that might contain scheme details
        keywords = ['scheme', 'guideline', 'scholarship', 'detail', 'apply', 'notification']
        for link in all_links:
            # Only stay on the same domain (or very close subdomains) to avoid crawling out into the wild
            link_domain = urllib.parse.urlparse(link).netloc.lower()
            base_domain = urllib.parse.urlparse(base_url).netloc.lower()
            
            # Simple heuristic: if it's the same domain or contains scheme keywords
            if base_domain in link_domain or link_domain in base_domain:
                link_lower = link.lower()
                if any(k in link_lower for k in keywords):
                     links.add(link)
    except Exception as e:
        logging.warning(f"Failed to extract deep links from {base_url}: {e}")
        
    return links

async def main():
    # Set your API Keys
    gemini_api_key = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
    supabase_url = os.environ.get("SUPABASE_URL", "YOUR_SUPABASE_URL_HERE")
    supabase_key = os.environ.get("SUPABASE_KEY", "YOUR_SUPABASE_ANON_KEY_HERE")
    
    gemini_api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAakiK9uIsXau1cFWVMHxASeVUCjtX_95E")
    supabase_url = os.environ.get("SUPABASE_URL", "https://swfmadqtvgijojrnkwii.supabase.co")
    supabase_key = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Zm1hZHF0dmdpam9qcm5rd2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDIwMDAsImV4cCI6MjA4Nzg3ODAwMH0.LX13pF60yXKYewe95FAj_FfXMAqbkmhS4aZq-dUK9eM")

    if gemini_api_key == "YOUR_GEMINI_API_KEY_HERE":
        logging.warning("Please set your GEMINI_API_KEY.")
        return

    # 1. Dynamic Real-Time Discovery
    search_queries = [
        "pre matric and post matric scholarship site:up.gov.in",
        "official state scholarship portal bihar site:bih.nic.in",
        "sje rajasthan scholarship portal latest schemes",
        "official foundational scholarships india application 2026",
        "mahadbt maharashtra scholarship portal guidelines site:maharashtra.gov.in"
    ]
    
    # 2. Get already processed URLs from Supabase
    processed_urls = get_processed_urls(supabase_url, supabase_key)
    
    all_scholarships = []
    failed_urls = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        # Perform the search using DDG with a Playwright Bing Scraper fallback
        found_urls = await search_scholarship_urls(search_queries, max_results_per_query=3, page=page)
        target_urls = list(set([str(u) for u in found_urls]))
        
        target_urls = [u for u in target_urls if u not in processed_urls]
        logging.info(f"Starting pipeline with {len(target_urls)} potential official URLs.")

        for url in target_urls:
            logging.info(f"--- Processing ROOT URL: {url} ---")
            
            # Step A: Genuity check before spending time deep crawling
            content = await fetch_page_content(url, page)
            if not content:
                failed_urls.append({"url": url, "title": "Fetch Failed", "reason": "Could not fetch root page"})
                continue
                
            if not is_verified_source(url, content, gemini_api_key):
                logging.warning(f"Skipping {url} as it failed Genuity Verification.")
                failed_urls.append({"url": url, "title": "Verification Failed", "reason": "Failed Genuity Trust Check"})
                continue
                
            # Step B: Deep Link Extraction - Look for specific schemes on this official hub
            logging.info(f"Extracting sub-scheme links from {url}...")
            deep_links = await extract_deep_links(page, url)
            deep_links = [dl for dl in deep_links if dl not in processed_urls] # avoid rescraping inner links
            
            if not deep_links:
                 # If no deep links found, just parse the main page
                 deep_links = [url]
                 
            for deep_url in deep_links:
                logging.info(f"Checking deep link: {deep_url}")
                # Refresh page content for the deep link if it's different from the root
                if deep_url != url:
                     sub_content = await fetch_page_content(deep_url, page)
                else:
                     sub_content = content
                     
                try:
                    page_title = await page.title()
                except:
                    page_title = "Unknown Title"
                    
                if sub_content:
                    is_gov = is_gov_website(deep_url)
                    scholarships = extract_scholarship_data(sub_content, deep_url, gemini_api_key, is_gov)
                    
                    if scholarships:
                        for scholarship_data in scholarships:
                            if scholarship_data.title:
                                dump = scholarship_data.model_dump()
                                if dump.get("deadline") == "":
                                    dump["deadline"] = None
                                all_scholarships.append(dump)
                        logging.info(f"Successfully extracted {len(scholarships)} scheme(s) from {deep_url}")
                    else:
                        logging.warning(f"No scholarship data on sub-page: {deep_url}")
                        # We don't always log sub-pages as failures if they are just aboutus pages
                else:
                    logging.warning(f"Could not load deep link: {deep_url}")
                
                # Small pause between inner pages
                await asyncio.sleep(1)
                
        await browser.close()
            
    # Save the output to a local JSON file as backup
    output_filename = "advanced_scholarships_output.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(all_scholarships, f, indent=2, ensure_ascii=False)
        
    logging.info(f"Scraped {len(all_scholarships)} total entries. Saved backup to {output_filename}")
    logging.info(f"Encountered {len(failed_urls)} failed URLs.")
    
    # Push to Supabase
    if supabase_url != "YOUR_SUPABASE_URL_HERE" and supabase_key != "YOUR_SUPABASE_ANON_KEY_HERE":
        push_to_supabase(all_scholarships, supabase_url, supabase_key, table_name="scholarships")
        
        # Push failed URLs to a separate table
        if failed_urls:
            push_to_supabase(failed_urls, supabase_url, supabase_key, table_name="failed_scholarships")
    else:
        logging.warning("Skipping Supabase push. Please set real credentials.")

if __name__ == "__main__":
    asyncio.run(main())
