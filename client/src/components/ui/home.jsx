import SearchBar from "./Search";

export default function Home({ setAccountName }) {
  return (
    <div className="bg-white text-black flex justify-center items-center min-h-screen p-4 min-w-screen">
      <div
        className="flex flex-col w-full max-w-2xl"
        style={{
          minWidth: "50vw",
          width: "70%",
        }}
      >
        <div className="mb-8 mx-auto w-full">
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-left">
            Hey there!
          </p>
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-left">
            Begin your account search
          </p>
        </div>
        <div className="w-full mx-auto">
          <SearchBar setAccountName={setAccountName} />
        </div>
      </div>
    </div>
  );
}
