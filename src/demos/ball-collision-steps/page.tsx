import Renderer from "./01-renderer/page";
import Input from "./02-input/page";
import Walls from "./03-walls/page";
import Collisions from "./04-collisions/page";
import Koota from "./05-koota/page";

export default function BallCollisionStepsPage() {
  const lessons = [
    { id: "1", Demo: Renderer },
    { id: "2", Demo: Input },
    { id: "3", Demo: Walls },
    { id: "4", Demo: Collisions },
    { id: "5", Demo: Koota },
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
            {lesson.id}
          </a>
        ))}
      </nav>
    </>
  );
}
