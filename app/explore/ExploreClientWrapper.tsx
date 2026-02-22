'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiStar, FiClock, FiShoppingCart, FiVideo, FiBook } from 'react-icons/fi';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function ExploreClientWrapper({ allItems }: { allItems: any[] }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
            {allItems.map((item) => (
                <motion.div variants={itemVariants} key={`${item.itemType}-${item.id}`}>
                    <Link
                        href={`/${item.itemType === 'course' ? 'courses' : 'product'}/${item.id}`} // Or slug
                        className="group relative block h-full outline-none"
                    >
                        {/* Hover Glow Behind Card */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-action-blue/50 to-purple-600/50 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition duration-500 delay-75 -z-10 mt-4 mx-2"></div>

                        <div className="bg-white dark:bg-card-white rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full ring-2 ring-transparent group-focus-visible:ring-action-blue">
                            {/* Media Thumbnails Area */}
                            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-black/10 transition-all after:transition-colors">
                                {(item.thumbnail || item.image || (item.images && item.images[0])) ? (
                                    <img
                                        src={item.thumbnail || item.image || item.images[0]}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-400 dark:text-gray-500">
                                        {item.itemType === 'course' ? <FiVideo className="text-5xl mb-2 opacity-50" /> : <FiBook className="text-5xl mb-2 opacity-50" />}
                                        <span className="font-bold text-sm tracking-widest uppercase">No Preview</span>
                                    </div>
                                )}

                                {/* Top Badges */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    {item.itemType === 'course' ? (
                                        <span className="bg-blue-500/90 dark:bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-white shadow-lg border border-white/20">
                                            دورة تدريبية
                                        </span>
                                    ) : item.category ? (
                                        <span className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg border border-white/20">
                                            {item.category === 'ebooks' ? 'كتاب إلكتروني' : item.category}
                                        </span>
                                    ) : null}

                                    {(item.isFree || item.price === 0) && (
                                        <span className="bg-green-500/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest text-white shadow-lg border border-white/20 animate-pulse-slow">
                                            مجاني
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Details Content Layout */}
                            <div className="p-6 sm:p-7 flex flex-col flex-1 relative bg-white dark:bg-card-white">
                                {/* Creator Mini-Profile Header */}
                                <div className="flex justify-between items-end mb-4 -mt-12">
                                    {/* Avatar pushing up from card content into image */}
                                    {item.user ? (
                                        <div className="flex flex-col items-start gap-1 p-1 bg-white dark:bg-card-white rounded-2xl">
                                            {item.user.avatar ? (
                                                <img src={item.user.avatar} className="w-14 h-14 rounded-xl shadow-md border-2 border-white dark:border-gray-800 object-cover" alt="creator" />
                                            ) : (
                                                <div
                                                    className="w-14 h-14 rounded-xl shadow-md border-2 border-white dark:border-gray-800 flex items-center justify-center text-xl text-white font-black uppercase"
                                                    style={{ backgroundColor: item.user.brandColor || '#4F46E5', backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(0,0,0,0.2))' }}
                                                >
                                                    {item.user.name?.charAt(0) || 'M'}
                                                </div>
                                            )}
                                        </div>
                                    ) : <div className="w-14 h-14"></div>}

                                    {/* Small floating rating above price area */}
                                    {(item.averageRating > 0 || item.rating > 0) && (
                                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300">
                                            <FiStar className="text-yellow-400 fill-yellow-400" />
                                            <span>{(item.averageRating || item.rating || 0).toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold mb-2 block">{item.user?.name || 'مبدع مستقل'}</span>

                                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-snug mb-3 line-clamp-2 group-hover:text-action-blue transition-colors will-change-transform">
                                    {item.title}
                                </h3>

                                {item.itemType === 'course' && (
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 dark:text-gray-500 mb-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg justify-center w-max">
                                        <div className="flex items-center gap-1.5"><FiClock className="text-gray-400" /> {item.totalDuration || item.duration || 0} دقيقة</div>
                                    </div>
                                )}

                                {item.itemType !== 'course' && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed flex-1">
                                        {item.description?.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                )}

                                {/* Card Footer: Price & Action */}
                                <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-50 dark:border-gray-800/60">
                                    <div>
                                        <span className="font-black text-2xl text-primary-charcoal dark:text-white">
                                            {item.price === 0 ? (
                                                <span className="text-green-500">مجاناً</span>
                                            ) : (
                                                <span className="bg-gradient-to-r from-action-blue to-purple-600 bg-clip-text text-transparent flex items-baseline gap-1">
                                                    {item.price} <span className="text-sm font-bold text-gray-400 dark:text-gray-500 ml-1">ج.م</span>
                                                </span>
                                            )}
                                        </span>
                                        {item.discountPrice && item.discountPrice < item.price && (
                                            <span className="text-sm text-gray-400 dark:text-gray-600 font-bold line-through block mt-0.5">
                                                {item.price} ج.م
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-12 h-12 rounded-[1rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-action-blue group-hover:text-white group-hover:shadow-lg group-hover:shadow-action-blue/30 transition-all duration-300 transform group-hover:-rotate-6">
                                        <FiShoppingCart size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
