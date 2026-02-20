'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiClock } from 'react-icons/fi';

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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function ExploreClientWrapper({ allItems }: { allItems: any[] }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
            {allItems.map((item) => (
                <motion.div variants={itemVariants} key={`${item.itemType}-${item.id}`}>
                    <Link
                        href={`/${item.itemType === 'course' ? 'courses' : 'product'}/${item.id}`} // Or slug
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    >
                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                            {(item.thumbnail || (item.images && item.images[0])) ? (
                                <Image
                                    src={item.thumbnail || item.images[0]}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                                    <span className="text-gray-400 font-medium">لا توجد صورة</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                                    {item.itemType === 'course' ? 'كورس' : 'منتج رقمي'}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                    style={{ backgroundColor: item.user?.brandColor || '#0ea5e9' }}
                                >
                                    {item.user?.name?.charAt(0) || 'M'}
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{item.user?.name}</span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-action-blue transition-colors">
                                {item.title}
                            </h3>

                            {item.itemType === 'course' && (
                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                    <div className="flex items-center gap-1"><FiClock /> {item.totalDuration || 0} دقيقة</div>
                                    <div className="flex items-center gap-1 text-yellow-500"><FiStar /> {item.rating || 0}</div>
                                </div>
                            )}

                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                <span className="font-black text-lg text-primary-charcoal">
                                    {item.price === 0 ? 'مجاناً' : `$${item.price}`}
                                </span>
                                {item.discountPrice && item.discountPrice < item.price && (
                                    <span className="text-sm text-gray-400 line-through">
                                        ${item.price}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
