// components/frontend/Milestones.tsx
import { Milestone } from '@/data/aboutData';

interface MilestonesProps {
    milestones: Milestone[];
}

export default function Milestones({ milestones }: MilestonesProps) {
    return (
        <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        发展历程
                    </h2>
                    <p className="text-gray-600">
                        我们的成长轨迹
                    </p>
                </div>

                <div className="relative">
                    {/* 时间线 */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="space-y-8">
                        {milestones.map((milestone) => (
                            <div key={milestone.id} className="relative pl-12">
                                {/* 节点 */}
                                <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-primary-500 rounded-full ring-4 ring-primary-100" />

                                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-primary-600">
                                        {milestone.year}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-800 mt-1">
                                        {milestone.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                        {milestone.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}