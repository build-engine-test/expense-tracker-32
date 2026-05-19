/**
 * Tests for Total component (task-3-3-list-and-total)
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { Total } from "./total";

describe("Total", () => {
  it("renders formatted currency for 0", () => {
    render(<Total total={0} />);
    expect(screen.getByText(/Total spent:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it("renders formatted currency for 12.5", () => {
    render(<Total total={12.5} />);
    expect(screen.getByText(/Total spent:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$12\.50/)).toBeInTheDocument();
  });
});
