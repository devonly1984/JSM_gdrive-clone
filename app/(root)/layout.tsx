
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const HomeLayout = async({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return redirect("/sign-in");
  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNav {...currentUser}/>
        <Header userId={currentUser.$id} accountId={currentUser.accountId}/>
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};
export default HomeLayout;
