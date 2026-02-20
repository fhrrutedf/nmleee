'use client';

import Link from 'next/link';
import { FiShoppingBag, FiVideo, FiCalendar, FiDollarSign, FiCheckCircle, FiArrowLeft, FiTrendingUp, FiLayers, FiShield, FiArrowDown } from 'react-icons/fi';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// --- Premium Animation Components ---

// 1. Text Reveal Animation (Word by Word)
const RevealText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: delay * 0.1 },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            transition: { type: "spring", damping: 12, stiffness: 100 },
        },
        hidden: {
            opacity: 0,
            y: 50,
            rotateZ: 10,
        },
    };

    return (
        <motion.div style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "inherit" }} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {words.map((word, index) => (
                <motion.span variants={child} style={{ marginRight: "0.25em", display: "inline-block" }} key={index} className={className}>
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};

// 2. Magnetic Button (Follows mouse slightly)
const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    const { x, y } = position;
    return (
        <motion.div
            style={{ position: "relative" }}
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// 3. 3D Tilt Card
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const x = useSpring(0, { stiffness: 300, damping: 30 });
    const y = useSpring(0, { stiffness: 300, damping: 30 });

    function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    const rotateX = useTransform(y, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(x, [-0.5, 0.5], ["-15deg", "15deg"]);

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
            onMouseMove={handleMouse}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className={className}
        >
            <div style={{ transform: "translateZ(50px)" }} className="w-full h-full relative z-10">
                {children}
            </div>
            {/* Soft Shadow behind the 3D card */}
            <motion.div
                className="absolute inset-0 bg-black/5 rounded-2xl -z-10 blur-xl"
                style={{ transform: "translateZ(-20px)" }}
            />
        </motion.div>
    );
}

export default function Home() {
    // Scroll Progress for Parallax
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    return (
        <main className="min-h-screen bg-bg-light overflow-hidden relative cursor-default">

            {/* Custom Cursor Overlay */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-action-blue pointer-events-none z-[100] mix-blend-difference hidden md:block"
                animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16, scale: isHovering ? 2 : 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-action-blue rounded-full pointer-events-none z-[100] hidden md:block"
                animate={{ x: mousePosition.x - 4, y: mousePosition.y - 4 }}
                transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.1 }}
            />



            {/* Hero Section */}
            <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden h-[100vh] min-h-[800px] flex items-center">

                {/* Parallax Background Blobs */}
                <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 600]) }} className="absolute inset-0 z-0 pointer-events-none">
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-10 right-[10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px]" />
                    <motion.div animate={{ scale: [1, 1.5, 1], x: [0, 100, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-10 left-[10%] w-[600px] h-[600px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[120px]" />
                    <motion.div animate={{ scale: [1, 1.3, 1], y: [0, -100, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-[90px]" />
                </motion.div>

                <div className="container-custom relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div style={{ y: yHero, opacity: opacityHero }} className="text-right">

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md text-action-blue rounded-full text-sm font-bold mb-8 border border-blue-100 shadow-lg shadow-blue-500/10"
                            >
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                                المنصة الأسرع نمواً لصناع المحتوى
                            </motion.div>

                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-heading text-primary-charcoal leading-[1.2]">
                                <RevealText text="حول شغفك إلى" delay={2} />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-action-blue to-purple-600 relative inline-block">
                                    <RevealText text="دخل مستدام" delay={4} />
                                    <motion.svg
                                        initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                                        animate={{ strokeDashoffset: 0 }}
                                        transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                                        className="absolute w-full h-4 -bottom-2 right-0 text-yellow-400 drop-shadow-md z-[-1]"
                                        viewBox="0 0 100 10"
                                        preserveAspectRatio="none"
                                    >
                                        <path d="M0 5 Q 50 15 100 0" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
                                    </motion.svg>
                                </span>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg font-medium"
                            >
                                لا تحتاج لخبرة تقنية. ابدأ بيع دوراتك، كتبك الإلكترونية، وخدماتك الاستشارية في دقائق معدودة وبأدوات احترافية.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                                className="flex flex-col sm:flex-row gap-5"
                            >
                                <MagneticButton>
                                    <Link href="/register"
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        className="btn bg-gray-900 text-white text-xl px-10 py-5 shadow-2xl shadow-gray-900/40 w-full justify-between group overflow-hidden relative rounded-2xl"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">أنشئ متجرك مجاناً</span>
                                        <motion.div
                                            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative z-10 group-hover:-translate-x-2 transition-transform"
                                        >
                                            <FiArrowLeft />
                                        </motion.div>
                                        <motion.span
                                            className="absolute inset-0 bg-gradient-to-l from-action-blue to-purple-600 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        />
                                    </Link>
                                </MagneticButton>
                                <MagneticButton>
                                    <Link href="#features"
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        className="btn btn-secondary text-lg px-8 py-5 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg w-full justify-center rounded-2xl hover:bg-white"
                                    >
                                        استكشف المنصة
                                    </Link>
                                </MagneticButton>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
                                className="mt-10 flex items-center gap-6 text-sm text-gray-500 flex-wrap font-medium"
                            >
                                {['تجربة مجانية', 'لا تتطلب بطاقة', 'إلغاء في أي وقت'].map((text, idx) => (
                                    <span key={idx} className="flex items-center gap-2">
                                        <FiCheckCircle className="text-green-500 text-lg" /> {text}
                                    </span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Interactive 3D Composition */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            className="relative h-[600px] hidden lg:block"
                        >
                            <TiltCard className="absolute top-10 left-10 right-10 bottom-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-8 flex flex-col z-10">
                                {/* Browser Mockup Header */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                    <div className="flex gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-inner"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-inner"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-inner"></div>
                                    </div>
                                    <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                                </div>

                                {/* Animated Dashboard Content inside 3D Card */}
                                <div className="flex gap-6 mb-8">
                                    <div className="w-1/3 bg-blue-50/50 rounded-2xl h-36 relative overflow-hidden flex flex-col justify-end p-4 border border-blue-100/50">
                                        <div className="text-gray-400 text-xs mb-1">المبيعات</div>
                                        <div className="text-xl font-bold text-gray-800 mb-2">$12,450</div>
                                        <motion.div className="h-1 bg-action-blue rounded" initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 1.5, delay: 1 }} />
                                    </div>
                                    <div className="w-1/3 bg-purple-50/50 rounded-2xl h-36 relative overflow-hidden flex flex-col justify-end p-4 border border-purple-100/50">
                                        <div className="text-gray-400 text-xs mb-1">الزيارات</div>
                                        <div className="text-xl font-bold text-gray-800 mb-2">45.2K</div>
                                        <motion.div className="h-1 bg-purple-500 rounded" initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 1.5, delay: 1.2 }} />
                                    </div>
                                    <div className="w-1/3 bg-green-50/50 rounded-2xl h-36 relative overflow-hidden flex flex-col justify-end p-4 border border-green-100/50">
                                        <div className="text-green-600 text-xs font-bold mb-1 flex justify-between">النمو <FiTrendingUp /></div>
                                        <div className="text-2xl font-bold text-green-600 mb-2">+24%</div>
                                        <motion.div className="h-full bg-green-100 absolute bottom-0 right-0 left-0 -z-10" initial={{ height: 0 }} animate={{ height: "40%" }} transition={{ duration: 1.5, delay: 1.4 }} />
                                    </div>
                                </div>

                                {/* Graph Mockup */}
                                <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100/50 p-4 relative overflow-hidden">
                                    <motion.svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <motion.path
                                            d="M0,100 L0,50 Q20,20 40,60 T80,30 T100,10 L100,100 Z"
                                            fill="url(#gradient)"
                                            initial={{ pathLength: 0, opacity: 0, y: 50 }}
                                            animate={{ pathLength: 1, opacity: 1, y: 0 }}
                                            transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#0052FF" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </motion.svg>
                                    <motion.path
                                        d="M0,50 Q20,20 40,60 T80,30 T100,10"
                                        fill="none"
                                        stroke="#0052FF"
                                        strokeWidth="3"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                                    />
                                </div>
                            </TiltCard>

                            {/* Floating Badges */}
                            <motion.div
                                animate={{ y: [-20, 20, -20], z: [0, 50, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="absolute -top-8 -right-8 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-100 z-20 flex items-center gap-4"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner"
                                >
                                    <FiDollarSign className="text-2xl" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">مبيعات جديدة</p>
                                    <p className="font-bold text-gray-900 text-lg">+ $450.00</p>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [20, -20, 20], x: [-10, 10, -10] }}
                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-24 -left-12 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-100 z-30 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-action-blue shadow-inner relative overflow-hidden">
                                    <motion.div
                                        animate={{ y: ["100%", "-100%"] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute inset-0 bg-white/50"
                                    />
                                    <FiVideo className="text-2xl relative z-10" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">دورة جديدة</p>
                                    <p className="font-bold text-gray-900 text-lg">تصميم الواجهات</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Animated Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-400"
                >
                    <span className="text-xs font-medium tracking-widest uppercase mb-2">استكشف</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-8 h-12 border-2 border-gray-300 rounded-full flex justify-center p-1"
                    >
                        <motion.div className="w-1.5 h-3 bg-gray-400 rounded-full" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Stats (Parallax Number Counters) */}
            <motion.section
                className="bg-primary-charcoal text-white py-20 relative overflow-hidden"
            >
                {/* Dynamic Grid Background */}
                <motion.div
                    style={{ y: useTransform(scrollYProgress, [0.2, 0.5], [0, 200]) }}
                    className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"
                />

                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-gray-700/50 divide-x-reverse">
                        {[
                            { value: "+10k", label: "صانع محتوى يبدع عبر منصتنا", delay: 0 },
                            { value: "$5M+", label: "أرباح موزعة على شركائنا", delay: 0.1 },
                            { value: "0%", label: "رسوم تأسيس أو تكاليف خفية", delay: 0.2 },
                            { value: "24/7", label: "دعم فني جاهز لخدمتك دوماً", delay: 0.3 }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ type: "spring", stiffness: 100, damping: 20, delay: stat.delay }}
                                className="group cursor-default"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, color: '#3B82F6' }}
                                    className="text-5xl md:text-6xl font-bold mb-4 text-white transition-colors duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-gray-400 font-medium leading-relaxed group-hover:text-gray-300 transition-colors max-w-xs mx-auto">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Features Grid with Hover Cards */}
            <section id="features" className="py-32 bg-gray-50 relative">
                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20 max-w-3xl mx-auto"
                    >
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-block py-1 px-3 rounded-full bg-blue-100 text-action-blue font-bold tracking-wider uppercase text-xs mb-6"
                        >
                            قوة لا محدودة
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading text-primary-charcoal">كل الأدوات التي تحتاجها <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-action-blue to-purple-600">للنجاح في مكان واحد</span></h2>
                        <p className="text-xl text-gray-500 font-medium">صممنا المنصة لتمنحك حرية الإبداع وقوة التجارة الإلكترونية، بدون أي تعقيدات برمجية.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <FiShoppingBag />, title: "متجر متكامل باسمك", desc: "امتلك هويتك الرقمية بالكامل مع متجر احترافي يعكس علامتك التجارية ويجذب جمهورك.", color: "from-blue-500 to-cyan-400" },
                            { icon: <FiDollarSign />, title: "بوابات دفع عالمية", desc: "استقبل مدفوعاتك من أي مكان في العالم بكل العملات وبدون أي تعقيدات تقنية.", color: "from-green-500 to-emerald-400" },
                            { icon: <FiTrendingUp />, title: "تسويق وعمولات", desc: "ضاعف مبيعاتك من خلال نظام المسوقين بالعمولة المدمج وشبكة شركاء النجاح.", color: "from-purple-500 to-pink-500" },
                            { icon: <FiVideo />, title: "استضافة الفيديو", desc: "نظام آمن ومحمي لرفع دوراتك ومحتواك المرئي مع منع التحميل والنسخ غير المصرح به.", color: "from-red-500 to-orange-500" },
                            { icon: <FiCalendar />, title: "حجوزات واستشارات", desc: "نظم وقتك وبع استشاراتك بالساعة مع تقويم ذكي متزامن مع Google Calendar.", color: "from-orange-400 to-yellow-400" },
                            { icon: <FiShield />, title: "حماية حقوقك", desc: "تقنيات متقدمة لحماية منتجاتك الرقمية من القرصنة وإعادة التوزيع بفضل التشفير القوي.", color: "from-indigo-500 to-blue-600" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                className="group relative bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100/80 overflow-hidden"
                            >
                                {/* Animated Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className="relative w-16 h-16 mb-8 group-hover:scale-110 transition-transform duration-500 ease-out">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500`} />
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg -rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-primary-charcoal group-hover:text-action-blue transition-colors duration-300">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>

                                {/* Bottom Accent Line */}
                                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} w-0 group-hover:w-full transition-all duration-700 ease-in-out`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="py-32 relative overflow-hidden bg-gray-900 border-t-4 border-action-blue">
                {/* Dynamic Mouse Tracking Light */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                    style={{
                        background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
                    }}
                />

                <div className="container-custom text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 font-heading text-white leading-tight">
                            ابدأ في تحقيق أرباحك <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">من اليوم الأول</span>
                        </h2>
                        <p className="text-2xl mb-12 text-gray-400 max-w-2xl mx-auto font-medium">
                            انضم لآلاف المبدعين، المنصة مجانية تماماً للتجربة ولا تحتاج بطاقة ائتمانية.
                        </p>

                        <div
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            className="inline-block"
                        >
                            <Link href="/register">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-tilt"></div>
                                    <div className="relative flex items-center gap-4 bg-gray-900 px-12 py-6 rounded-full leading-none text-white text-2xl font-bold">
                                        انطلق الآن
                                        <FiArrowLeft className="group-hover:-translate-x-2 transition-transform duration-300" />
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>


        </main>
    );
}
