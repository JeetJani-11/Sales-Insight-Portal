const LinkPreview = ({ metadata }) => {
  return (
    <a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start p-2 bg-white rounded-2xl"
    >
      {metadata.image && (
        <img
          src={metadata.image}
          alt={metadata.title}
          className="w-10 h-10 min-h-10 min-w-10 object-cover rounded-full overflow-hidden"
        />
      )}
      <div className="ml-3">
        <h3 className="text-sm font-medium text-gray-500 line-clamp-1">
          {metadata.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2">{metadata.description}</p>
      </div>
    </a>
  );
};

export default LinkPreview;
