import "@testing-library/jest-dom";
import { ReadableStream } from "stream/web";
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
global.ReadableStream =
  ReadableStream as unknown as typeof global.ReadableStream;

let uuidCounter = 0;
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => `00000000-0000-4000-8000-${String(++uuidCounter).padStart(12, "0")}`,
  },
  configurable: true,
});

jest.mock("react-markdown", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({
      children,
    }: {
      children: React.ReactNode;
    }) => React.createElement("div", { "data-testid": "markdown" }, children),
  };
});

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: () => undefined,
}));
