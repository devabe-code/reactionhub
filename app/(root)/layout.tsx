import { auth } from '@/auth';
import Header from '@/components/Header';
import Sidebar from '@/components/AppSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import React from 'react'
import { ReactNode } from 'react'
import AppSidebar from '@/components/AppSidebar';
import Footer from '@/components/Footer';

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  /*
  if (!session) {
    redirect('/sign-in');
  }

  after( async () => {
    if(!session?.user?.id) return;

    // Get user and see if lastActivityDate is today
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

    if(user[0].lastActivityDate === new Date().toISOString().slice(0,10)) return;

    await db.update(users).set({lastActivityDate: new Date()
      .toISOString().slice(0,10)})
      .where(eq(users.id, session.user.id));
  })
      */
  return (
    <SidebarProvider defaultOpen={false}>
        <AppSidebar session={session!} />
        <SidebarInset>
            <main className="">
                <div className="pb-20">
                    <Header />
                    <div className=''>
                        {children}
                    </div>
                    <Footer />
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout