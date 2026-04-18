'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';
import { getVideos, getCategories } from '@/lib/api';
import { Loader2, Film } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchVideos = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const data = await getVideos({
        search: searchQuery || undefined,
        category: activeCategory !== 'All' ? activeCategory : undefined,
        page: currentPage,
        limit: 20,
      });
      if (reset) {
        setVideos(data.videos);
        setPage(1);
      } else {
        setVideos(prev => [...prev, ...data.videos]);
      }
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, activeCategory, page]);

  useEffect(() => {
    getCategories().then(d => setCategories(d.categories));
  }, []);

  useEffect(() => {
    fetchVideos(true);
  }, [searchQuery, activeCategory]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(false);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        {!searchQuery && (
          <div className="mb-10">
            <h1 className="font-display text-5xl md:text-7xl text-white mb-2 tracking-wider">
              STREAM <span className="gradient-text">VAULT</span>
            </h1>
            <p className="text-white/40 text-sm">Your personal streaming platform</p>
          </div>
        )}

        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white/80">
              Results for <span className="text-brand-400">"{searchQuery}"</span>
            </h2>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-dark-700 text-white/50 hover:text-white/80 hover:bg-dark-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Videos grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-video rounded-xl mb-3" />
                <div className="skeleton h-4 rounded mb-2 w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-semibold text-white/30 mb-1">No videos found</h3>
            <p className="text-sm text-white/20">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {videos.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-dark-700 hover:bg-dark-600 border border-white/8 rounded-xl text-white/70 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-900 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-brand-500" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
