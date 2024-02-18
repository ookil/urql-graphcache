import Link from "next/link";
import React from "react";

const SecondPage = () => {
  return (
    <div>
      <h1>This is Second Page</h1>
      <Link href={"/ "}>Go to first page</Link>
    </div>
  );
};

export default SecondPage;
