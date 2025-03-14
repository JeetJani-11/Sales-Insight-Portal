import Markdown from "react-markdown";


export function Node({ data }) {
 
  return (
    <article
      className="nodrag text-black bg-white border border-gray-200 p-4 rounded-3xl shadow-lg flex items-center justify-center text-xs"
      style={{
        height: "50px",
        width: "200px",
      }}
    >
      <Markdown>{data.content}</Markdown>
    </article>
  );
}
