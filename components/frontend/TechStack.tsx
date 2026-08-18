// components/frontend/TechStack.tsx
import { TechItem } from '@/data/aboutData';

interface TechStackProps {
    technologies: TechItem[];
}

export default function TechStack({ technologies }: TechStackProps) {
    return (
        <section className="py-16 bg-white border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        技术栈
                    </h2>
                    <p className="text-gray-600">
                        我们使用的核心技术
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {technologies.map((tech) => (
                        <div
                            key={tech.name}
                            className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300 text-center group"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                {tech.icon}
                            </div>
                            <h3 className="text-base font-semibold text-gray-800">{tech.name}</h3>
                            <p className="text-xs text-primary-600 font-medium mt-1">{tech.category}</p>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tech.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}