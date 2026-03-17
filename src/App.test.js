import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders service cards heading", () => {
  render(<App />);
  const headingElement = screen.getByText(/our services/i);
  expect(headingElement).toBeInTheDocument();
});
