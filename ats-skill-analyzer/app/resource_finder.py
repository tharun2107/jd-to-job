import requests

API_KEY = "7ae3ffccd3b611da7fad65acee2f5a0036207a1a"
SERPER_URL = "https://google.serper.dev/search"

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def search_learning_links(skill, max_results=5):
    query = f"learn {skill} site:geeksforgeeks.org OR site:w3schools.com OR site:freecodecamp.org"
    data = { "q": query }
    print(f"[Serper] Searching articles for skill: {skill}, query: {query}")
    response = requests.post(SERPER_URL, headers=headers, json=data)
    print(f"[Serper] Response status: {response.status_code}")
    if response.status_code != 200:
        print(f"❌ Serper error ({response.status_code}) for {skill}: {response.text}")
        return []
    results = response.json().get("organic", [])[:max_results]
    resources = []
    for item in results:
        resources.append({
            "title": item.get("title"),
            "url": item.get("link"),
            "source": item.get("link").split('/')[2],
            "free": True
        })
    return resources

def search_youtube_videos(skill, max_results=3):
    import re
    query = f"{skill} tutorial site:youtube.com"
    print(f"[Serper] Searching YouTube videos for skill: {skill}, query: {query}")
    response = requests.post(
        "https://google.serper.dev/videos",
        headers=headers,
        json={"q": query}
    )
    print(f"[Serper] YouTube response status: {response.status_code}")
    if response.status_code != 200:
        print(f"❌ Error fetching videos for {skill}: {response.status_code} {response.text}")
        return []
    results = response.json().get("videos", [])[:max_results]
    videos = []
    for vid in results:
        thumbnail = vid.get("thumbnailUrl") or ""
        url = vid.get("link")
        # Fallback: If thumbnail is missing, extract video ID and use default YouTube thumbnail
        if not thumbnail and url:
            match = re.search(r"v=([\w-]+)", url)
            if match:
                video_id = match.group(1)
                thumbnail = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
        videos.append({
            "title": vid.get("title"),
            "url": url,
            "thumbnail": thumbnail,
            "source": "YouTube",
            "free": True
        })
    return videos