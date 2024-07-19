import Link from "next/link";

const mainPage = () => {
  return (
    <div className="bg-gradient-to-tl from-gray-200 to-gray-700 w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent pb-20">
        File Transfer App
      </h1>
      <div className="flex flex-row items-center justify-between w-[12rem]">
        <Link
          href="/send"
          className="font-semibold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent"
        >
          Send File
        </Link>
        <Link
          href="/get"
          className="font-semibold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent"
        >
          Get File
        </Link>
      </div>
    </div>
  );
};

export default mainPage;
