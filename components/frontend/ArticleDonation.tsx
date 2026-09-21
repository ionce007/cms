// components/frontend/ArticleList.tsx
import { cn } from '@/lib/utils';
import SafeImage from './SafeImage';

interface ArticleDonationProps {
    title?: string;
}

function getPayUrl() {
    const wxPay = process.env.PAY_WX || '//img.foryet.com/uploads/2026/0125_31014606929_wxPay.png';
    const aliPay = process.env.PAY_ALIPAY || '//img.foryet.com/uploads/2026/0125_31014634042_zfbPay.png';
    return { wxPay, aliPay };
}

export default function ArticleDonation({ title = '☕ 请我喝咖啡（鞠躬） ❤️' }: ArticleDonationProps) {
    const payUrl = getPayUrl();
    const aliPay = payUrl.aliPay;
    const wxPay = payUrl.wxPay;
    return (
        <div>
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl text-center font-bold text-gray-800">{title}</h2>
            </div>
            {/* 图片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <article className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 group', 'animate-slide-up')} style={{ animationDelay: `0ms` }}>
                    {/* 付款码图片 */}
                    <a className="block relative overflow-hidden aspect-video">
                        {/*<img src={wxPay} alt='微信支付打赏码' className="max-w-3xl mx-auto h-full object-cover group-hover:scale-105 transition-transform duration-500"/>*/}
                        <SafeImage
                            src={wxPay}
                            alt='微信支付打赏码'
                            className="max-w-3xl mx-auto h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </a>
                    {/* 支付说明 */}
                    <div className="p-5">
                        {/* 支付方式 */}
                        <h3 className="text-lg text-center font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">微信支付</h3>
                    </div>
                </article>
                <article className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 group', 'animate-slide-up')} style={{ animationDelay: `100ms` }}>
                    {/* 付款码图片 */}
                    <a className="block relative overflow-hidden aspect-video">
                        {/*<img src={aliPay} alt='支付宝支付打赏码' className="max-w-3xl mx-auto h-full object-cover group-hover:scale-105 transition-transform duration-500" />*/}
                        <SafeImage
                            src={aliPay}
                            alt='支付宝支付打赏码'
                            className="max-w-3xl mx-auto h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </a>
                    {/* 支付说明 */}
                    <div className="p-5">
                        {/* 支付方式 */}
                        <h3 className="text-lg text-center font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">支付宝支付</h3>
                    </div>
                </article>
            </div>
        </div>
    );
}