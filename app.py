from flask import Flask, request, jsonify, render_template
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin, urlparse
import json
import logging

app = Flask(__name__)

JINA_READER_API_URL = "https://r.jina.ai/"  # Jina Reader API base URL

visited_urls = set()
collected_contents = {}

logging.basicConfig(level=logging.INFO)

def is_valid(url):
    parsed = urlparse(url)
    return bool(parsed.netloc) and bool(parsed.scheme)

def get_all_website_links(url):
    urls = set()
    domain_name = urlparse(url).netloc
    try:
        soup = BeautifulSoup(requests.get(url).content, "html.parser")
        for a_tag in soup.findAll("a"):
            href = a_tag.attrs.get("href")
            if href == "" or href is None:
                continue
            href = urljoin(url, href)
            parsed_href = urlparse(href)
            href = parsed_href.scheme + "://" + parsed_href.netloc + parsed_href.path
            if not is_valid(href):
                continue
            if domain_name not in href:
                continue
            if href in visited_urls:
                continue
            urls.add(href)
            visited_urls.add(href)
    except Exception as e:
        logging.error(f"Error occurred while getting links from {url}: {e}")
    return urls

def crawl(url):
    links = get_all_website_links(url)
    for link in links:
        crawl(link)

def get_content_from_jina_reader(url):
    try:
        response = requests.get(f"{JINA_READER_API_URL}{url}")
        return response.json()
    except Exception as e:
        logging.error(f"Error occurred while fetching content from {url} using Jina Reader: {e}")
        return {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/crawl', methods=['POST'])
def crawl_site():
    data = request.get_json()
    start_url = data['url']
    visited_urls.clear()
    collected_contents.clear()
    logging.info(f"Starting crawl for {start_url}")
    crawl(start_url)
    logging.info(f"Completed crawl for {start_url}")
    for url in visited_urls:
        logging.info(f"Fetching content for {url}")
        collected_contents[url] = get_content_from_jina_reader(url)
    with open('knowledge.json', 'w') as f:
        json.dump(collected_contents, f, indent=4)
    return jsonify({"message": "Crawling completed and knowledge file created.", "knowledge_file": "knowledge.json"})

if __name__ == '__main__':
    app.run(debug=True)
