'use client';

import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'أحمد علي',
    role: 'مصمم جرافيك',
    content: 'منصة تمالين سهلت علي بيع قوالبي الرقمية بشكل لم أتوقعه. الواجهة احترافية جداً والدعم فني سريع.',
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    rating: 5
  },
  {
    name: 'سارة محمود',
    role: 'مدربة أونلاين',
    content: 'أفضل منصة عربية لبيع الدورات الرقمية. نظام حماية الملفات يعطي طمأنينة كبيرة لي كمدربة.',
    avatar: 'https://i.pravatar.cc/150?u=sara',
    rating: 5
  },
  {
    name: 'ياسين عمر',
    role: 'مبرمج',
    content: 'التجربة كانت استثنائية. تمكنت من البدء في بيع أدواتي البرمجية خلال دقائق معدودة وبدون أي تعقيدات.',
    avatar: 'https://i.pravatar.cc/150?u=yassin',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-indigo-600 font-bold text-sm tracking-widest uppercase bg-indigo-50 px-4 py-2 rounded-full"
          >
            ماذا يقول عملاؤنا
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mt-6"
          >
            نحن نبني المستقبل <br/> <span className="text-primary-indigo-600">بثقتكم</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 hover:shadow-glow transition-all group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, idx) => (
                  <FiStar key={idx} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed font-medium mb-8 text-lg">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div>
                  <h4 className="font-black text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-400 font-bold">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
