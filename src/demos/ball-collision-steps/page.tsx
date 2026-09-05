import Renderer from "./01-renderer/page";
import Input from "./02-input/page";
import Walls from "./03-walls/page";
import Collisions from "./04-collisions/page";

export default function BallCollisionStepsPage() {
  const lessons = [
    { id: "1", title: "Ball renderer", Demo: Renderer },
    { id: "2", title: "Drag and fling", Demo: Input },
    { id: "3", title: "Walls", Demo: Walls },
    { id: "4", title: "Ball collisions", Demo: Collisions },
  ];
  const step = new URLSearchParams(window.location.search).get("step");
  const current = lessons.find((lesson) => lesson.id === step) ?? lessons[0];

  return (
    <>
      <current.Demo />
      <nav
        aria-label="Ball collision lessons"
        className="fixed top-4 left-1/2 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap justify-center gap-1 rounded-2xl bg-[#ffeab6]/95 p-2 text-xs text-[#41301d]"
      >
        {lessons.map((lesson) => (
          <a
            key={lesson.id}
            href={`?step=${lesson.id}`}
            aria-current={lesson === current ? "step" : undefined}
            className="rounded-lg px-3 py-2 hover:bg-black/5 aria-[current=step]:bg-[#41301d] aria-[current=step]:text-[#ffeab6]"
          >
            {lesson.id}. {lesson.title}
          </a>
        ))}
      </nav>
    </>
  );
}
