import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNELS_FILE = "./channels.json";
// Save videos.json inside frontend/public so React can fetch it
const OUTPUT_FILE = path.join("frontend", "public", "videos.json");

async function fetchVideos(channel) {
  try {
    // Fetch latest 10 videos to filter later
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channelId}&type=video&order=date&maxResults=10&key=${API_KEY}`;
    const res = await axios.get(url);

    const videoIds = res.data.items.map(v => v.id.videoId).join(",");

    // Fetch video details including duration and view count
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
    const detailsRes = await axios.get(detailsUrl);

    const videos = detailsRes.data.items
      .filter(v => {
        const duration = v.contentDetails.duration; // ISO 8601 format
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return totalSeconds >= 240; // Only videos >= 4 minutes
      })
      .slice(0, 3) // take top 3 after filtering
      .map(v => {
        const snippet = res.data.items.find(item => item.id.videoId === v.id);
        return {
          channelName: channel.name,
          videoId: v.id,
          title: snippet.snippet.title,
          description: snippet.snippet.description,
          publishedAt: snippet.snippet.publishedAt,
          thumbnail: snippet.snippet.thumbnails.high.url,
          views: parseInt(v.statistics.viewCount || 0)
        };
      });

    return videos;
  } catch (err) {
    console.error(`Error fetching ${channel.name}:`, err.response?.data || err.message);
    return [];
  }
}

async function fetchAllChannels() {
  const channels = JSON.parse(fs.readFileSync(CHANNELS_FILE));
  const allVideos = [];

  for (const channel of channels) {
    console.log(`Fetching videos from: ${channel.name}`);
    const videos = await fetchVideos(channel);
    allVideos.push(...videos);
  }

  // Ensure frontend/public exists
  const publicDir = path.join("frontend", "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allVideos, null, 2));
  console.log(`Saved all videos to ${OUTPUT_FILE}`);
}

fetchAllChannels();
