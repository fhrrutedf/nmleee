'use client';

import { useState, useMemo } from 'react';
import { 
    FiPlus, FiMoreVertical, FiVideo, FiFileText, 
    FiCheckCircle, FiChevronRight, FiChevronDown, 
    FiTrash2, FiEdit3, FiMove, FiEye 
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'text';
    duration: number; // in minutes
    url?: string;
}

interface Section {
    id: string;
    title: string;
    lessons: Lesson[];
}

export default function CourseBuilder({ 
    onUpdate 
}: { 
    onUpdate: (data: { sessions: number; totalDuration: number; structure: Section[] }) => void 
}) {
    const [sections, setSections] = useState<Section[]>([
        { id: 'sec-1', title: 'المقدمة الأساسية', lessons: [] }
    ]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>('sec-1');

    // Auto-calculate stats
    const stats = useMemo(() => {
        let count = 0;
        let total = 0;
        sections.forEach(s => {
            count += s.lessons.length;
            s.lessons.forEach(l => total += l.duration || 0);
        });
        return { count, total };
    }, [sections]);

    const addSection = () => {
        const newSec = { id: `sec-${Date.now()}`, title: 'قسم جديد', lessons: [] };
        setSections([...sections, newSec]);
        onUpdate({ sessions: stats.count, totalDuration: stats.total, structure: [...sections, newSec] });
    };

    const addLesson = (sectionId: string) => {
        const newLesson: Lesson = { 
            id: `les-${Date.now()}`, 
            title: 'عنوان الدرس...', 
            type: 'video', 
            duration: 10 
        };
        const updated = sections.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s);
        setSections(updated);
        onUpdate({ sessions: stats.count + 1, totalDuration: stats.total + 10, structure: updated });
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const { source, destination, type } = result;

        if (type === 'SECTION') {
            const reordered = Array.from(sections);
            const [removed] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, removed);
            setSections(reordered);
            onUpdate({ sessions: stats.count, totalDuration: stats.total, structure: reordered });
            return;
        }

        // Reordering lessons within same section or across
        const sIdx = sections.findIndex(s => s.id === source.droppableId);
        const dIdx = sections.findIndex(s => s.id === destination.droppableId);
        
        const newSections = [...sections];
        const [moved] = newSections[sIdx].lessons.splice(source.index, 1);
        newSections[dIdx].lessons.splice(destination.index, 0, moved);
        
        setSections(newSections);
        onUpdate({ sessions: stats.count, totalDuration: stats.total, structure: newSections });
    };

    return (
        <div className="space-y-6">
            
            {/* Real-time Stats Display */}
            <div className="flex gap-4 p-5 bg-primary-indigo-50 border border-primary-indigo-100 rounded-3xl">
                <div className="flex-1">
                    <p className="text-xs font-bold text-primary-indigo-600 uppercase mb-1">الدروس</p>
                    <p className="text-2xl font-black text-slate-900">{stats.count} درس</p>
                </div>
                <div className="flex-1 border-r border-primary-indigo-100 pr-5">
                    <p className="text-xs font-bold text-primary-indigo-600 uppercase mb-1">إجمالي الوقت</p>
                    <p className="text-2xl font-black text-slate-900">{stats.total} دقيقـة</p>
                </div>
                <div className="flex items-center text-primary-indigo-600">
                    <FiEye className="text-2xl" />
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="builder" type="SECTION">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {sections.map((section, index) => (
                                <Draggable key={section.id} draggableId={section.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden group">
                                            {/* Section Header */}
                                            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing">
                                                        <FiMove size={18} />
                                                    </div>
                                                    <input 
                                                        className="font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            const upd = sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s);
                                                            setSections(upd);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => addLesson(section.id)} className="text-xs font-bold text-primary-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors">+ درس</button>
                                                    <button className="text-slate-400 hover:text-red-500 transition-colors p-2"><FiTrash2 /></button>
                                                </div>
                                            </div>

                                            {/* Lessons List */}
                                            <Droppable droppableId={section.id} type="LESSON">
                                                {(provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef} 
                                                        {...provided.droppableProps} 
                                                        className={`p-4 pt-0 space-y-2 min-h-[50px] transition-all ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
                                                    >
                                                        {section.lessons.map((lesson, lIndex) => (
                                                            <Draggable key={lesson.id} draggableId={lesson.id} index={lIndex}>
                                                                {(provided, snapshot) => (
                                                                    <div 
                                                                        ref={provided.innerRef} 
                                                                        {...provided.draggableProps} 
                                                                        {...provided.dragHandleProps}
                                                                        className={`flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group/lesson ${snapshot.isDragging ? 'shadow-glow border-primary-indigo-400 scale-105 bg-white z-50' : 'hover:border-slate-300'}`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-indigo-600">
                                                                                <FiVideo size={14} />
                                                                            </div>
                                                                            <input 
                                                                                className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0"
                                                                                value={lesson.title}
                                                                                onChange={(e) => {
                                                                                    const upd = sections.map(s => s.id === section.id ? { 
                                                                                        ...s, 
                                                                                        lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l) 
                                                                                    } : s);
                                                                                    setSections(upd);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                                                                                <FiEdit3 /> {lesson.duration}m
                                                                            </span>
                                                                            <button className="opacity-0 group-hover/lesson:opacity-100 text-slate-400 hover:text-red-500 transition-all"><FiTrash2 size={14} /></button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button 
                onClick={addSection} 
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black hover:border-primary-indigo-400 hover:text-primary-indigo-600 transition-all flex items-center justify-center gap-2"
            >
                <FiPlus /> إضافة قسم جديد للمنهج
            </button>
        </div>
    );
}
