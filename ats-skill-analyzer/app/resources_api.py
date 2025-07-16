from flask import Blueprint, request, jsonify
from app.resource_finder import search_learning_links, search_youtube_videos
from app.resources_loader import load_skill_resources

resources_bp = Blueprint('resources', __name__)

@resources_bp.route('/api/resources', methods=['POST'])
def get_resources():
    data = request.json
    skills = data.get('skills') or []
    resources = {}
    static_resources = load_skill_resources()
    for skill in skills:
        articles = static_resources.get(skill.lower(), [])
        articles = articles if isinstance(articles, list) else []
        articles += search_learning_links(skill)
        videos = search_youtube_videos(skill)
        resources[skill] = {
            "articles": articles,
            "videos": videos
        }
    return jsonify({"resources": resources}) 