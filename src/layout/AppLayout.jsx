export default function AppLayout({ sidebar, header, chat, thread }) {
  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-64 border">{sidebar}</div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col">
        {/* Shared Header */}
        {header}

        {/* Chat + Thread */}
        <div className="flex flex-1">
          <div className="flex-1 flex flex-col bg-white">
            {chat}
          </div>

          {thread && (
            <div className="w-80 border-l bg-gray-50">
              {thread}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
