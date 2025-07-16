import os
from googleapiclient.discovery import build

# Replace with your actual YouTube Data API key
YOUTUBE_API_KEY = "AIzaSyDaC0o67LzK5T32t90Wrc3VAIbe6TvOOf0"  # 🔁 Replace this
youtube = build("youtube", "v3", developerKey="AIzaSyDyT1_Vo45FGKlW7E2Q0qzZktzYcKxb-C8")

def search_youtube_videos(skill, max_results=5):
    try:
        request = youtube.search().list(
            q=f"{skill} tutorial",
            part="snippet",
            maxResults=max_results,
            type="video",
            videoEmbeddable="true",
            safeSearch="moderate"
        )
        response = request.execute()

        videos = []
        for item in response.get("items", []):
            video_id = item["id"]["videoId"]
            snippet = item["snippet"]

            videos.append({
                "title": snippet["title"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"]["medium"]["url"],
                "free": True  # Always free since it's YouTube
            })

        return videos

    except Exception as e:
        print(f"❌ YouTube API error for '{skill}': {e}")
        return []