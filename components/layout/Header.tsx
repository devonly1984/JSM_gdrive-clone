import Image from "next/image";
import { Button } from "../ui/button";
import FileUploader from "../shared/FileUploader";
import Search from "../shared/Search";
import { signOutUser } from "@/lib/actions/user.actions";

const Header = () => {
  return (
    <header className="header">
      <Search/>
      <div className="header-wrapper">
        <FileUploader/>
        <form action={async()=>{
          "use server";
          await signOutUser();
        }}>
          <Button type="submit" className="sign-out-buton">
            <Image
              src="/assets/icons/logout.svg"
              alt="logout"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};
export default Header;