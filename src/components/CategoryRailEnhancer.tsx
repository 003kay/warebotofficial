import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createRoot, type Root } from "react-dom/client";

type RailControlProps = {
  direction: "start" | "end";
  onClick: () => void;
};

function RailControl({ direction, onClick }: RailControlProps) {
  const isStart = direction === "start";
  const Icon = isStart ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isStart ? "Go to first command category" : "Go to last command category"}
      title={isStart ? "First category" : "Last category"}
      className={`category-rail-jump category-rail-jump-${direction}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function CategoryRailEnhancer() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let observer: MutationObserver | undefined;

    const install = () => {
      const rail = document.querySelector<HTMLElement>(".command-category-strip");
      if (!rail || rail.dataset.railEnhanced === "true") return false;

      rail.dataset.railEnhanced = "true";
      rail.classList.add("category-rail-enhanced");

      const wrapper = document.createElement("div");
      wrapper.className = "category-rail-shell";
      rail.parentElement?.insertBefore(wrapper, rail);
      wrapper.appendChild(rail);

      const leftHost = document.createElement("div");
      const rightHost = document.createElement("div");
      leftHost.className = "category-rail-control-host category-rail-control-left";
      rightHost.className = "category-rail-control-host category-rail-control-right";
      wrapper.append(leftHost, rightHost);

      const leftRoot: Root = createRoot(leftHost);
      const rightRoot: Root = createRoot(rightHost);

      const jumpToStart = () => rail.scrollTo({ left: 0, behavior: "smooth" });
      const jumpToEnd = () => rail.scrollTo({ left: rail.scrollWidth, behavior: "smooth" });

      leftRoot.render(<RailControl direction="start" onClick={jumpToStart} />);
      rightRoot.render(<RailControl direction="end" onClick={jumpToEnd} />);

      const onWheel = (event: WheelEvent) => {
        if (rail.scrollWidth <= rail.clientWidth) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        rail.scrollBy({ left: event.deltaY * 1.25, behavior: "auto" });
      };

      const updateEdges = () => {
        const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
        wrapper.dataset.atStart = String(rail.scrollLeft <= 4);
        wrapper.dataset.atEnd = String(rail.scrollLeft >= max - 4);
      };

      rail.addEventListener("wheel", onWheel, { passive: false });
      rail.addEventListener("scroll", updateEdges, { passive: true });
      window.addEventListener("resize", updateEdges);
      requestAnimationFrame(updateEdges);

      cleanup = () => {
        rail.removeEventListener("wheel", onWheel);
        rail.removeEventListener("scroll", updateEdges);
        window.removeEventListener("resize", updateEdges);
        leftRoot.unmount();
        rightRoot.unmount();
        rail.dataset.railEnhanced = "false";
        rail.classList.remove("category-rail-enhanced");
        const parent = wrapper.parentElement;
        parent?.insertBefore(rail, wrapper);
        wrapper.remove();
      };
      return true;
    };

    if (!install()) {
      observer = new MutationObserver(() => {
        if (install()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      cleanup?.();
    };
  }, []);

  return null;
}
