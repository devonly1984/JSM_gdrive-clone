import { ReactNode } from "react";

const AuthLayout = ({
    children,
  }: Readonly<{
    children: ReactNode;
  }>) => {
  return <div>{children}</div>;
};
export default AuthLayout;
