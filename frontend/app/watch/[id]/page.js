'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';
import { getVideo, getVideos } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Eye, Calendar, Tag, ArrowLeft, Loader2 } from 'lucide-react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }

    getVideo(id)
      .then(({ video }) => {
        setVideo(video);
        return getVideos({ category: video.category, limit: 8 });
      })
      .then(({ videos }) => setRelated(videos.filter(v => v._id !== id)))
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, [id, user, authLoading]);

  const videoSrc = video?.videoType === 'upload'
    ? `${API_BASE}${video.videoUrl}`
    : video?.videoUrl;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player */}
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50 mb-6">
              <ReactPlayer
                url={videoSrc}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  file: {
                    attributes: { controlsList: 'nodownload' },
                    forceVideo: true,
                  },
                }}
              />
            </div>

            {/* Video info */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="px-3 py-1 bg-brand-500/15 text-brand-400 text-xs font-semibold rounded-full border border-brand-500/20">
                  {video.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">{video.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-white/40 mb-4">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} /> {video.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>

              {video.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-4">{video.description}</p>
              )}

              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-dark-600 rounded-lg text-xs text-white/40">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
              More in {video.category}
            </h2>
            <div className="flex flex-col gap-4">
              {related.slice(0, 6).map(v => (
                <VideoCard key={v._id} video={v} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
