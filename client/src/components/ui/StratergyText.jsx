import Markdown from "react-markdown";

const StratergyText = ({ stratergy }) => {
  return (
    <div
      id="output"
      className="prose prose-slate lg:prose-lg max-w-none leading-loose"
    >
      <Markdown>{stratergy}</Markdown>
    </div>
  );
};

export default StratergyText;
