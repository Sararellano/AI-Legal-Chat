import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", false && "hidden", "block")).toBe(
      "text-red-500 block",
    );
  });
});
