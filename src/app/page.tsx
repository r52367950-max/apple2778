"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = { quote: string; name: string; role: string };

const reportCards = [
  { title: "增长总览", desc: "30秒内自动汇总渠道投放、LTV 与漏斗转化。" },
  { title: "异常预警", desc: "发现异常峰值并给出可执行修复建议。" },
  { title: "团队日报", desc: "按角色生成可读摘要，自动推送到 Slack/邮箱。" },
  { title: "董事会简报", desc: "一键生成高管视角图文报告与关键结论。" }
];

const integrations = ["Slack", "Notion", "HubSpot", "Google Ads", "Stripe", "Snowflake"];

const testimonials: Testimonial[] = [
  { quote: "我们每周节省了 8 小时做报表的时间。", name: "Luna", role: "Growth Lead @ Sailor" },
  { quote: "跨团队对齐速度明显提升，老板终于能看懂数据。", name: "Ming", role: "COO @ NovaBridge" },
  { quote: "从数据到行动建议几乎是实时的，执行效率提高很多。", name: "Jasper", role: "Marketing Director @ Helio" }
];

const faq = [
  { q: "支持接入私有数据仓库吗？", a: "支持，提供只读连接器与权限隔离策略。" },
  { q: "是否有团队协作功能？", a: "有，支持评论、@提醒、角色权限和版本历史。" },
  { q: "价格是否可定制？", a: "企业版可按席位与数据量定制，欢迎联系销售。" }
];

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [slide, setSlide] = useState(0);
  const integrationRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.25 }
    );

    integrationRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const price = isYearly ? 32 : 39;

  return (
    <main className="relative soft-layer px-5 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="glass rounded-3xl p-8 md:p-12" aria-labelledby="hero-title">
          <h1 id="hero-title" className="text-4xl font-semibold tracking-tight md:text-5xl">
            用自动化报告，把分析时间还给增长团队
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700">
            InsightFlow 将分散数据整合成可执行洞察，帮助你更快做出增长决策。
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" aria-label="邮箱收集表单">
            <label htmlFor="email" className="sr-only">
              电子邮箱
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="输入你的工作邮箱"
              className="focus-ring btn-rounded w-full border border-white/80 bg-white/70 px-4 py-3"
            />
            <button type="submit" className="focus-ring btn-rounded bg-[#355cff] px-5 py-3 font-medium text-white">
              免费试用
            </button>
          </form>
        </section>

        <section aria-labelledby="reports-title">
          <h2 id="reports-title" className="mb-4 text-2xl font-semibold">
            示例报告
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reportCards.map((item) => (
              <article key={item.title} className="glass rounded-2xl p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-slate-700">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="integration-title">
          <h2 id="integration-title" className="mb-4 text-2xl font-semibold">
            集成生态
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {integrations.map((name, idx) => (
              <div
                key={name}
                ref={(el) => {
                  integrationRef.current[idx] = el;
                }}
                className="integration-card glass rounded-2xl p-5"
              >
                <h3 className="text-lg font-medium">{name}</h3>
                <p className="mt-1 text-sm text-slate-700">无缝同步，分钟级刷新数据。</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-6" aria-labelledby="testimonial-title">
          <h2 id="testimonial-title" className="text-2xl font-semibold">
            客户评价
          </h2>
          <div
            className="mt-4"
            role="region"
            aria-label="客户评价轮播"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setSlide((prev) => (prev + 1) % testimonials.length);
              if (e.key === "ArrowLeft") setSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            }}
          >
            <blockquote className="text-lg">“{testimonials[slide].quote}”</blockquote>
            <p className="mt-3 text-sm text-slate-700">
              {testimonials[slide].name} · {testimonials[slide].role}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                className="focus-ring btn-rounded border border-slate-300 bg-white/70 px-3 py-2"
                onClick={() => setSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                aria-label="上一条评价"
              >
                ←
              </button>
              <button
                className="focus-ring btn-rounded border border-slate-300 bg-white/70 px-3 py-2"
                onClick={() => setSlide((prev) => (prev + 1) % testimonials.length)}
                aria-label="下一条评价"
              >
                →
              </button>
            </div>
            <ul className="sr-only" aria-label="客户评价静态列表备选">
              {testimonials.map((t) => (
                <li key={t.name}>{`${t.name}: ${t.quote}`}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="glass rounded-3xl p-6" aria-labelledby="pricing-title">
          <h2 id="pricing-title" className="text-2xl font-semibold">
            透明定价
          </h2>
          <div className="mt-4 inline-flex rounded-2xl border border-white/80 bg-white/60 p-1">
            <button
              className={`focus-ring btn-rounded px-4 py-2 ${!isYearly ? "bg-[#355cff] text-white" : "text-slate-700"}`}
              aria-pressed={!isYearly}
              onClick={() => setIsYearly(false)}
            >
              月付
            </button>
            <button
              className={`focus-ring btn-rounded px-4 py-2 ${isYearly ? "bg-[#355cff] text-white" : "text-slate-700"}`}
              aria-pressed={isYearly}
              onClick={() => setIsYearly(true)}
            >
              年付（省18%）
            </button>
          </div>
          <p className="mt-5 text-4xl font-semibold">¥{price}</p>
          <p className="text-slate-700">每席位 / 月，含无限仪表板与自动洞察建议。</p>
        </section>

        <section className="glass rounded-3xl p-6" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-semibold">
            常见问题
          </h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="btn-rounded border border-white/90 bg-white/65 p-4">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-slate-700">© {new Date().getFullYear()} InsightFlow. All rights reserved.</footer>
      </div>
    </main>
  );
}
