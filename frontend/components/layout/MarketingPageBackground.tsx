'use client';

/** Shared ambient background for public marketing / legal pages (grid + soft glows). Parent should be `relative`. */
export function MarketingPageBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50 dark:opacity-60 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-[5%] right-[-10%] w-[520px] h-[520px] bg-blue-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-8%] w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 pointer-events-none dark:hidden">
        <div className="absolute top-0 right-1/4 w-[480px] h-[320px] bg-blue-50/80 rounded-full blur-[90px]" />
      </div>
    </>
  );
}
