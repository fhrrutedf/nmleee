'use client';

import { useState, useMemo } from 'react';
import { 
    FiPlus, FiVideo, FiCheckCircle, FiTrash2, FiEdit3, FiMove, FiEye 
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
        const updated = [...sections, newSec];
        setSections(updated);
        onUpdate({ sessions: stats.count, totalDuration: stats.total, structure: updated });
    };

    const addLesson = (sectionId: string) => {
        const newLesson: Lesson = { 
            id: `les-${Date.now()}`, 
            title: 'عنوان الدرس الجديد...', 
            type: 'video', 
            duration: 10 
        };
        const updated = sections.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s);
        setSections(updated);
        onUpdate({ sessions: stats.count + 1, totalDuration: stats.total + 10, structure: updated });
    };

    const deleteSection = (sectionId: string) => {
        const updated = sections.filter(s => s.id !== sectionId);
        setSections(updated);
        onUpdate({ sessions: stats.count, totalDuration: stats.total, structure: updated });
    };

    const deleteLesson = (sectionId: string, lessonId: string) => {
        const updated = sections.map(s => s.id === sectionId ? {
            ...s,
            lessons: s.lessons.filter(l => l.id !== lessonId)
        } : s);
        setSections(updated);
        onUpdate({ sessions: stats.count, totalDuration: stats.total, structure: updated });
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
            
            {/* Professional Stats Display */}
            <div className="flex gap-4 p-6 bg-[#111111] border border-white/10 rounded-xl">
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">إجمالي الدروس</p>
                    <p className="text-2xl font-bold text-[#10B981] font-inter">{stats.count}</p>
                </div>
                <div className="flex-1 border-r border-emerald-500/20 pr-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">مدة المنهج</p>
                    <p className="text-2xl font-bold text-[#10B981] font-inter">{stats.total}m</p>
                </div>
                <div className="flex items-center text-[#10B981]">
                    <FiEye className="text-xl" />
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="builder" type="SECTION">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {sections.map((section, index) => (
                                <Draggable key={section.id} draggableId={section.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-lg shadow-[#10B981]/20 overflow-hidden group">
                                            {/* Section Header */}
                                            <div className="p-4 flex items-center justify-between hover:bg-[#111111] transition-colors">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div {...provided.dragHandleProps} className="text-gray-300 hover:text-[#10B981] transition-colors cursor-grab active:cursor-grabbing">
                                                        <FiMove size={18} />
                                                    </div>
                                                    <input 
                                                        className="font-bold text-[#10B981] bg-transparent border-none focus:ring-0 p-0 w-full text-lg"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            const upd = sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s);
                                                            setSections(upd);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => addLesson(section.id)} 
                                                        className="text-[10px] font-bold text-[#10B981] bg-[#111111] px-5 py-2.5 rounded-xl hover:bg-emerald-700 text-white hover:text-white transition-all uppercase tracking-widest border border-white/10"
                                                    >
                                                        + ADD LESSON
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => deleteSection(section.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Lessons List */}
                                            <Droppable droppableId={section.id} type="LESSON">
                                                {(provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef} 
                                                        {...provided.droppableProps} 
                                                        className={`p-4 pt-0 space-y-2 min-h-[40px] transition-all ${snapshot.isDraggingOver ? 'bg-[#111111]' : ''}`}
                                                    >
                                                        {section.lessons.map((lesson, lIndex) => (
                                                            <Draggable key={lesson.id} draggableId={lesson.id} index={lIndex}>
                                                                {(provided, snapshot) => (
                                                                    <div 
                                                                        ref={provided.innerRef} 
                                                                        {...provided.draggableProps} 
                                                                        {...provided.dragHandleProps}
                                                                        className={`flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/10 rounded-xl group/lesson ${snapshot.isDragging ? 'shadow-lg shadow-[#10B981]/20 ring-2 ring-accent/20 border-emerald-600' : 'hover:border-emerald-500/20 shadow-lg shadow-[#10B981]/20'}`}
                                                                    >
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center text-[#10B981] transition-all group-hover/lesson:bg-emerald-700 text-white group-hover/lesson:text-white border border-white/10">
                                                                                <FiVideo size={16} />
                                                                            </div>
                                                                            <input 
                                                                                className="text-sm font-bold text-[#10B981] bg-transparent border-none focus:ring-0 p-0"
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
                                                                        <div className="flex items-center gap-5">
                                                                            <span className="text-[10px] font-bold text-gray-400 font-inter tracking-widest flex items-center gap-2">
                                                                                <FiEdit3 /> {lesson.duration}M
                                                                            </span>
                                                                            <button 
                                                                                type="button" 
                                                                                onClick={() => deleteLesson(section.id, lesson.id)}
                                                                                className="hidden group-hover/lesson:block text-gray-300 hover:text-red-500 transition-all"
                                                                            >
                                                                                <FiTrash2 size={14} />
                                                                            </button>
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
                type="button"
                onClick={addSection} 
                className="w-full py-6 border border-dashed border-emerald-500/20 rounded-[2rem] text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:border-emerald-600 hover:text-[#10B981] transition-all flex items-center justify-center gap-3 bg-[#0A0A0A] shadow-lg shadow-[#10B981]/20"
            >
                <FiPlus className="text-xl" /> ADD NEW CHAPTER
            </button>
        </div>
    );
}
