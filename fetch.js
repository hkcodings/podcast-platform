import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCsT0YIqwnpJCM-mx7-gSA4Q"; // Example channel (TED)

async function fetchVideos() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&order=date&maxResults=5&key=${API_KEY}`;
    const res = await axios.get(url);

    console.log("Latest 5 videos from channel:");
    res.data.items.forEach(video => {
      console.log(video.snippet.title, "-> https://www.youtube.com/watch?v=" + video.id.videoId);
    });
  } catch (err) {
    console.error("Error fetching videos:", err.response?.data || err.message);
  }
}

fetchVideos();