import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
const BACKENDURL =
  "https://680a-44-202-48-12.ngrok-free.app/";
export default function SearchInterface({ setAccountName }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [inputFocused, setInputFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [error, setError] = React.useState(null);
  const fetchResults = React.useCallback(
    async (searchQuery) => {
      if (results.length <= 0) {
        setLoading(true);
      }
      console.log("Fetching results for:", results);
      const res = await fetch(`${BACKENDURL}search/`, {
        method: "POST",
        body: JSON.stringify({ searchQuery: searchQuery }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      if (data.searchResults) {
        if (data.searchResults.length > 0) {
          setActiveIndex(0);
        }
        setResults(data.searchResults);
      }
      setLoading(false);
    },
    [results.length]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchResults(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      if (activeIndex === results.length - 1) {
        setActiveIndex(0);
      } else {
        setActiveIndex((prev) => prev + 1);
      }
    } else if (e.key === "ArrowUp") {
      if (activeIndex === 0) {
        setActiveIndex(results.length - 1);
      } else {
        setActiveIndex((prev) => prev - 1);
      }
    } else if (e.key === "Enter" && activeIndex !== -1) {
      const activeResult = results[activeIndex];
      if (activeResult) {
        setInputFocused(false);
        setAccountName(activeResult.NAME);
        setQuery("");
        setResults([]);
        document.activeElement.blur();
      }
    }
  };

  const handleResultClick = (result, index) => {
    setInputFocused(false);
    setActiveIndex(index);
    setAccountName(result.NAME);
    setQuery("");
    setResults([]);
  };

  if (error) {
    return (
      <div
        className="bg-white text-black-200 p-6 rounded-3xl shadow-lg"
        onKeyDown={handleKeyDown}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
          <input
            type="search"
            placeholder="Search..."
            value={query}
            onFocus={() => setInputFocused(true)}
            onBlur={() => {
              if (!query) setInputFocused(false);
            }}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-3xl bg-white pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {(inputFocused || query) && (
          <>
            <div className="mt-6 space-y-6">
              <div className="text-sm text-gray-400">
                Error Occured. Try Again Later.
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
                >
                  ↓
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
                >
                  Navigate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
                >
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
                >
                  ↵
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-white text-black-200 p-6 rounded-3xl shadow-lg border border-gray-700"
      onKeyDown={handleKeyDown}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
        <input
          type="search"
          placeholder="Search..."
          value={query}
          onFocus={() => setInputFocused(true)}
          onBlur={() => {
            if (!query) setInputFocused(false);
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-3xl bg-white border border-black pl-10 pr-4 py-2 text-sm text-black placeholder-black focus:outline-none focus:ring-0.5 focus:ring-black"
        />
      </div>

      {(inputFocused || query) && (
        <>
          <div className="mt-6 space-y-6">
            {loading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : results.length > 0 ? (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3 text-black">
                    Results
                  </h3>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center w-full gap-2 p-4 bg-white border-2 ${
                          activeIndex === index
                            ? "border-black"
                            : ""
                        } text-black rounded-3xl hover:bg-gray-200 cursor-pointer`}
                        onClick={() => handleResultClick(result, index)}
                      >
                        <Avatar>
                          <AvatarImage
                            src={`https://cdn.brandfetch.io/${result.WEBSITE}?c=1idaroPYX6MwOp6glye`}
                          />
                          <AvatarFallback>
                            {result.NAME[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">{result.NAME}</div>
                          <div className="text-sm text-gray-400">
                            {result.TYPE && (
                              <span className="mr-2">{result.TYPE}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              query && (
                <div className="text-sm text-gray-400">
                  No results found for &quot;{query}&quot;
                </div>
              )
            )}
          </div>
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black border-black"
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black border-black"
              >
                ↓
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black border-black"
              >
                Navigate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black border-black"
              >
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black border-black"
              >
                ↵
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
