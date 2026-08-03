import { m } from "@/paraglide/messages";

interface ArchiveYearProps {
  year: number;
  count: number;
}

export function ArchiveYear({ year, count }: ArchiveYearProps) {
  return (
    <div className="flex flex-row w-full items-center h-15">
      <div className="w-[15%] md:w-[10%] transition text-2xl font-bold text-right fuwari-text-75"
        style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}>
        {year}
      </div>
      <div className="w-[15%] md:w-[10%]">
        <div
          className="h-3 w-3 rounded-full mx-auto z-50"
          style={{
            background: "var(--anime-sakura)",
            boxShadow: "0 0 0 3px oklch(0.75 0.1 350 / 0.25), 0 0 12px oklch(0.7 0.14 350 / 0.2)",
          }}
        />
      </div>
      <div className="w-[70%] md:w-[80%] transition text-left fuwari-text-50">
        {m.posts_count({ count })}
      </div>
    </div>
  );
}
