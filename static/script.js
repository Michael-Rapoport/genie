
document.getElementById('crawlForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const url = document.getElementById('url').value;
    fetch('/crawl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').textContent = data.message;
        fetch('/knowledge.json')
        .then(response => response.json())
        .then(contents => {
            let resultHTML = '<h2>Crawled URLs and Contents</h2>';
            for (const [url, content] of Object.entries(contents)) {
                resultHTML += `<h3>${url}</h3><pre>${JSON.stringify(content, null, 2)}</pre>`;
            }
            document.getElementById('results').innerHTML = resultHTML;
        })
        .catch(error => {
            console.error('Error fetching knowledge file:', error);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'An error occurred during crawling.';
    });
});
Additional Features and Improvements
Rate Limiting and User-Agent Customization:

Add rate limiting to avoid overloading the server being crawled.
Customize the user-agent to identify your crawler.
Robots.txt Compliance:

Respect the robots.txt file to avoid crawling restricted areas.
Parallel Processing:

Use a library like concurrent.futures or asyncio to handle crawling in parallel, improving efficiency.
UI Enhancements:

Improve the UI with better styling and interactive elements using a framework like Bootstrap or React.
Error Handling and Reporting:

Enhance error handling to provide more informative messages and logs.
Implement a reporting mechanism to log errors and performance metrics.
Final Code Enhancements
Rate Limiting and User-Agent Customization
In app.py, update the get_all_website_links function:

import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(connect=3, backoff_factor=0.5)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)

def get_all_website_links(url):
    urls = set()
    domain_name = urlparse(url).netloc
    headers = {'User-Agent': 'MyCrawler/1.0 (+https://mywebsite.com/crawler)'}
    try:
        response = session.get(url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")
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
        time.sleep(1)  # Rate limiting
    except Exception as e:
        logging.error(f"Error occurred while getting links from {url}: {e}")
    return urls
