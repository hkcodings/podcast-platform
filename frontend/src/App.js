import React, { useEffect, useState } from "react";

const INITIAL_LOAD = 12;

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/videos.json")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => {
          const viewsA = Number(a.views) || 0;
          const viewsB = Number(b.views) || 0;
          return viewsB - viewsA;
        });
        setVideos(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching videos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2 className="text-center mt-10 text-xl">Loading podcasts...</h2>;

  const getBestThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const featured = videos[0];
  const remainingVideos = videos.slice(1, visibleCount);

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">🎙️ Podcast Platform</h1>

      {/* Featured Video */}
      {featured && (
        <div className="mb-8 relative bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out group">
          <a
            href={`https://www.youtube.com/watch?v=${featured.videoId}`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={getBestThumbnail(featured.videoId)}
              alt={featured.title}
              className="w-full h-96 sm:h-[500px] object-cover rounded-t-lg"
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-20 h-20 text-white"
                fill="currentColor"
                viewBox="0 0 84 84"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="42" cy="42" r="42" fill="currentColor" opacity="0.5"/>
                <polygon points="33,25 33,59 59,42" fill="white"/>
              </svg>
            </div>

            {/* Top-left badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                {featured.channelName}
              </span>
              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                {Number(featured.views).toLocaleString()} views
              </span>
            </div>

            {/* Bottom title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h2 className="text-white text-lg sm:text-2xl font-bold">{featured.title}</h2>
              <p className="text-gray-300 text-sm">{new Date(featured.publishedAt).toLocaleDateString()}</p>
            </div>
          </a>
        </div>
      )}

      {/* Grid of Remaining Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {remainingVideos.map((video, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out relative group"
          >
            <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />

              {/* Hover overlays */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-16 h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 84 84"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="42" cy="42" r="42" fill="currentColor" opacity="0.5"/>
                  <polygon points="33,25 33,59 59,42" fill="white"/>
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                <p>{video.channelName}</p>
                <p>{Number(video.views).toLocaleString()} views • {new Date(video.publishedAt).toLocaleDateString()}</p>
              </div>
            </a>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < videos.length && (
        <div className="text-center mt-6">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => setVisibleCount(visibleCount + INITIAL_LOAD)}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
