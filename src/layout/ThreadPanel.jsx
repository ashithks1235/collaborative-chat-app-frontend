import ThreadMessageList from "../components/thread/ThreadMessageList";
import ThreadInput from "../components/thread/ThreadInput";

export default function ThreadPanel() {
  return (
    <div className="h-full flex flex-col">
      <ThreadMessageList />
      <ThreadInput />
    </div>
  );
}
