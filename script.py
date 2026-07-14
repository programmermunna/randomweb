import concurrent.futures
import re
import requests
from urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)

TARGET_FILES = [
    "DB/general.js",
    # "DB/tools.js",
    "DB/games.js",
    "DB/art.js"
]

MAX_WORKERS = 50
TIMEOUT = 5

def check_url(url):
    try:
        response = requests.head(
            url, 
            timeout=TIMEOUT, 
            allow_redirects=True, 
            verify=False,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        if response.status_code < 400:
            return url, True
    except requests.RequestException:
        try:
            response = requests.get(
                url, 
                timeout=TIMEOUT, 
                allow_redirects=True, 
                verify=False,
                headers={"User-Agent": "Mozilla/5.0"}
            )
            if response.status_code < 400:
                return url, True
        except requests.RequestException:
            pass
            
    return url, False

def process_file(file_path):
    print(f"\nProcessing file: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {file_path} not found. Skipping...")
        return

    var_match = re.search(r'(var|const|let)\s+(\w+)\s*=\s*\[', content)
    if not var_match:
        print(f"Could not find JS array variable in {file_path}. Skipping...")
        return
        
    var_declaration = var_match.group(1)
    var_name = var_match.group(2)

    urls = re.findall(r'"(https?://.*?)"', content)
    
    if not urls:
        print(f"No URLs found in {file_path}.")
        return

    print(f"Found {len(urls)} URLs. Checking status...")

    alive_urls = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = executor.map(check_url, urls)
        for result in results:
            url, is_alive = result
            if is_alive:
                alive_urls.append(url)
                print(f"[ALIVE] {url}")
            else:
                print(f"[DEAD]  {url}")

    new_content = f"{var_declaration} {var_name} = [\n"
    for url in alive_urls:
        new_content += f'  "{url}",\n'
    new_content += "];\n"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Done! {file_path} updated. Active: {len(alive_urls)} / {len(urls)}")

def main():
    for file_path in TARGET_FILES:
        process_file(file_path)

if __name__ == "__main__":
    main()