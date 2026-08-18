// app/about/page.tsx
import { Metadata } from 'next';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import AboutHero from '@/components/frontend/AboutHero';
import TeamSection from '@/components/frontend/TeamSection';
import TechStack from '@/components/frontend/TechStack';
import Milestones from '@/components/frontend/Milestones';
import ContactSection from '@/components/frontend/ContactSection';
import { teamMembers, techStack, milestones } from '@/data/aboutData';

export const metadata: Metadata = {
    title: '关于我们',
    description: '了解 TechBlog 的团队、技术栈和发展历程',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 关于页面头部 */}
                <AboutHero />

                {/* 网站使命 */}
                <section className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            我们的使命
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            我们致力于为开发者提供高质量的技术内容，帮助大家在技术道路上不断成长。
                            通过分享实战经验、深入浅出的教程和前沿技术解读，
                            让每一个热爱技术的人都能在这里找到价值。
                        </p>
                    </div>
                </section>

                {/* 团队介绍 */}
                <TeamSection members={teamMembers} />

                {/* 技术栈 */}
                <TechStack technologies={techStack} />

                {/* 发展历程 */}
                <Milestones milestones={milestones} />

                {/* 联系方式 */}
                <ContactSection />
            </main>

            <Footer />
        </div>
    );
}