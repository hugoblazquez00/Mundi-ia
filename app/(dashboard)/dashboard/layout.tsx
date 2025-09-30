'use client';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
 
  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)]  w-full pt-6">
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto w-full ">{children}</main>
      </div>
    </div>
  );
}
